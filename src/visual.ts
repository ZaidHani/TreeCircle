/*
 *  Power BI Visual CLI
 *
 *  Copyright (c) Microsoft Corporation
 *  All rights reserved.
 *  MIT License
 *
 *  Permission is hereby granted, free of charge, to any person obtaining a copy
 *  of this software and associated documentation files (the ""Software""), to deal
 *  in the Software without restriction, including without limitation the rights
 *  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 *  copies of the Software, and to permit persons to whom the Software is
 *  furnished to do so, subject to the following conditions:
 *
 *  The above copyright notice and this permission notice shall be included in
 *  all copies or substantial portions of the Software.
 *
 *  THE SOFTWARE IS PROVIDED *AS IS*, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 *  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 *  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 *  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 *  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 *  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 *  THE SOFTWARE.
 */
/// <reference path="./powerbi-ambient.d.ts" />
import * as d3 from "d3";
import { VisualSettings } from "./settings";

declare function inicializarArbol(height: number, width: number, options: any, host: any, settings: any, idDiv: string): void;

type VisualUpdateOptions = any;
type VisualConstructorOptions = any;
type EnumerateVisualObjectInstancesOptions = any;
type VisualObjectInstance = any;
type VisualObjectInstanceEnumerationObject = any;
type DataView = any;

export class Visual {
        private host: any;
        private tooltipServiceWrapper: any;
        private target: HTMLElement;
        private updateCount: number;
        private settings: VisualSettings;
        private textNode: Text;
        private colorPalete: any;
        private idDiv: string;
        private oldOptions: VisualUpdateOptions;
        private errorDiv: HTMLElement;

        private flattenNodes(root: any): any[] {
            const out: any[] = [];
            const walk = (n: any) => {
                out.push(n);
                if (n.children) n.children.forEach(walk);
            };
            walk(root);
            return out;
        }

        private truncateLabel(text: string, maxLen: number): string {
            if (!text) return "";
            if (text.length <= maxLen) return text;
            return text.substring(0, maxLen - 1) + "\u2026";
        }
        
        private buildTreeFromCategories(options: VisualUpdateOptions): any {
            const root = { name: "All", category: "Root", children: [] as any[], depth: 0, count: 0 };
            const dv = options && options.dataViews && options.dataViews[0];
            if (!dv || !dv.categorical || !dv.categorical.categories || dv.categorical.categories.length === 0) {
                return root;
            }

            const categories = dv.categorical.categories;
            const rowCount = categories[0] && categories[0].values ? categories[0].values.length : 0;

            for (let r = 0; r < rowCount; r++) {
                let current = root;
                current.count += 1;
                for (let c = 0; c < categories.length; c++) {
                    const cat = categories[c];
                    const rawValue = cat.values ? cat.values[r] : null;
                    const label = (rawValue === null || rawValue === undefined) ? "(blank)" : String(rawValue);
                    let child = current.children.find((x: any) => x.name === label && x.category === cat.source.displayName);
                    if (!child) {
                        child = {
                            name: label,
                            category: cat.source.displayName,
                            children: [],
                            depth: c + 1,
                            count: 0
                        };
                        current.children.push(child);
                    }
                    child.count += 1;
                    current = child;
                }
            }

            return root;
        }

        private renderFallbackLegend(svgRoot: d3.Selection<any>, categories: any[]): void {
            if (!this.settings || !this.settings.legend || !this.settings.legend.enableLegend || !categories || categories.length === 0) {
                return;
            }
            const fontSize = Math.max(8, this.settings.legend.legendFontSize || 12);
            const spacing = Math.max(12, this.settings.legend.legendItemSpacing || 20);
            const items = categories.map((c: any, i: number) => "Step " + (i + 1) + ": " + c.source.displayName);

            const width = Number(svgRoot.attr("width")) || 600;
            const height = Number(svgRoot.attr("height")) || 400;
            const boxWidth = Math.max(180, Math.min(360, Math.max.apply(null, items.map(x => x.length)) * Math.max(6, fontSize * 0.55) + 26));
            const boxHeight = items.length * spacing + 12;
            const pos = this.settings.legend.legendPosition || "top-left";
            let x = 10;
            let y = 10;
            if (pos === "top-right") x = width - boxWidth - 10;
            if (pos === "bottom-left") y = height - boxHeight - 10;
            if (pos === "bottom-right") { x = width - boxWidth - 10; y = height - boxHeight - 10; }

            const g = svgRoot.append("g").attr("class", "fallback-legend");
            g.append("rect")
                .attr("x", x)
                .attr("y", y)
                .attr("width", boxWidth)
                .attr("height", boxHeight)
                .style("fill", "#ffffff")
                .style("fill-opacity", 0.9)
                .style("stroke", "#d0d0d0");

            const rows = g.selectAll("g.legend-row")
                .data(items)
                .enter()
                .append("g")
                .attr("transform", (d: any, i: number) => "translate(" + (x + 10) + "," + (y + 8 + i * spacing) + ")");

            rows.append("rect")
                .attr("x", 0)
                .attr("y", 0)
                .attr("width", 10)
                .attr("height", 10)
                .style("fill", this.settings.treeColors && this.settings.treeColors.arcBaseColor ? this.settings.treeColors.arcBaseColor : "#4C78A8");

            rows.append("text")
                .attr("x", 16)
                .attr("y", 9)
                .style("font-size", fontSize + "px")
                .style("fill", "#333")
                .text((d: any) => d);
        }

        private renderFallbackTree(options: VisualUpdateOptions, height: number, width: number): void {
            const container = d3.select("#" + this.idDiv);
            container.select("svg").remove();

            const dv = options && options.dataViews && options.dataViews[0];
            const categories = dv && dv.categorical && dv.categorical.categories ? dv.categorical.categories : [];
            const data = this.buildTreeFromCategories(options);
            const margin = { top: 20, right: 80, bottom: 20, left: 220 };
            const w = Math.max(300, width - margin.left - margin.right);
            const h = Math.max(200, height - margin.top - margin.bottom);
            const nodeTextSize = Math.max(8, this.settings && this.settings.treeLabels ? this.settings.treeLabels.nodeTextSize : 12);
            const categoryLabelX = this.settings && this.settings.treeLabels ? this.settings.treeLabels.categoryLabelXpos : 0;
            const categoryLabelY = this.settings && this.settings.treeLabels ? this.settings.treeLabels.categoryLabelYpos : 0;
            const linkOpacity = this.settings && this.settings.treeOptions ? this.settings.treeOptions.linksOpacity : 0.5;
            const linkSize = this.settings && this.settings.treeOptions ? this.settings.treeOptions.linksSize : 2;
            const weightLinks = this.settings && this.settings.treeOptions ? this.settings.treeOptions.weightLinks : true;
            const arcBaseColor = this.settings && this.settings.treeColors ? this.settings.treeColors.arcBaseColor : "lightsteelblue";
            const nodeBgColor = this.settings && this.settings.treeColors ? this.settings.treeColors.nodeBgColor : "#fff";
            const linkColor = this.settings && this.settings.treeColors ? this.settings.treeColors.linkColor : "#b5b5b5";
            const nodeColorSeries = this.settings && this.settings.treeColors ? this.settings.treeColors.nodeColorSeries : true;
            const linkColorSeries = this.settings && this.settings.treeColors ? this.settings.treeColors.linkColorSeries : true;
            const maxCount = Math.max(1, d3.max(this.flattenNodes(data), function(n: any) { return n.count || 1; }) as any);

            const tree = d3.layout.tree().size([h, w]);
            const diagonal = d3.svg.diagonal().projection(function(d: any) { return [d.y, d.x]; });

            const svgRoot = container
                .append("svg")
                .attr("width", w + margin.left + margin.right)
                .attr("height", h + margin.top + margin.bottom);

            this.renderFallbackLegend(svgRoot, categories);

            const svg = svgRoot
                .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

            const nodes = tree.nodes(data);
            const links = tree.links(nodes);

            svg.selectAll("path.link")
                .data(links)
                .enter()
                .append("path")
                .attr("class", "link")
                .attr("d", diagonal)
                .style("stroke", function(d: any) {
                    if (!linkColorSeries || !d.target || !d.target.name) return linkColor;
                    return d.target.__seriesColor || linkColor;
                })
                .style("stroke-width", function(d: any) {
                    if (!weightLinks) return Math.max(1.5, linkSize / 3);
                    return Math.max(1.5, (d.target.count / maxCount) * Math.max(2, linkSize));
                })
                .style("stroke-opacity", Math.max(0, Math.min(1, linkOpacity)))
                .style("fill", "none");

            const node = svg.selectAll("g.node")
                .data(nodes)
                .enter()
                .append("g")
                .attr("class", "node")
                .attr("transform", function(d: any) { return "translate(" + d.y + "," + d.x + ")"; });

            node.each((d: any) => {
                if (!d.__seriesColor) {
                    d.__seriesColor = this.host.colorPalette.getColor((d.category || "") + ":" + (d.name || "")).value;
                }
            });

            node.append("circle")
                .attr("r", function(d: any) {
                    if (!weightLinks) return 6;
                    return Math.max(4, (d.count / maxCount) * Math.max(6, linkSize * 0.6));
                })
                .style("fill", (d: any) => {
                    if (!nodeColorSeries || !d.name || d.category === "Root") return nodeBgColor;
                    return this.host.colorPalette.getColor(d.category + ":" + d.name).value;
                })
                .style("stroke", arcBaseColor);

            node.append("text")
                .attr("dx", function(d: any) { return d.children && d.children.length ? -12 : 12; })
                .attr("x", categoryLabelX)
                .attr("y", categoryLabelY)
                .attr("dy", ".35em")
                .style("text-anchor", function(d: any) { return d.children && d.children.length ? "end" : "start"; })
                .style("font-size", nodeTextSize + "px")
                .text((d: any) => {
                    if (!d.category || d.category === "Root") return this.truncateLabel(d.name, 45);
                    return this.truncateLabel(d.category + ": " + d.name, 45);
                });
        }

        
        

        constructor(options: VisualConstructorOptions) {
            options.element.style.overflowX = 'auto';
            this.host = options.host;            
            this.target = options.element;            
            if (typeof document !== "undefined") {                
                const new_div: HTMLElement = document.createElement("div");
                var d = new Date().getTime().toString();
                var r = Math.floor(Math.random()*1000).toString();
                this.idDiv="div_arbol_"+d+r;
                //cambioid
                //new_div.id="div_arbol";
                new_div.id=this.idDiv;
                this.target.appendChild(new_div);

                
            }

            //wellcome page
            const wellcome_div : HTMLElement = document.createElement("div");
            wellcome_div.id="wellcome_div";

            const title = document.createElement("p");
            title.style.fontSize = "25px";
            title.textContent = "PIE CHARTS TREE (1.0.3)";
            wellcome_div.appendChild(title);

            const hint = document.createElement("p");
            hint.style.fontWeight = "bolder";
            hint.textContent = "Put an attribute in the Categories field to start the tree...";
            wellcome_div.appendChild(hint);

            const author = document.createElement("p");
            author.textContent = "Created by Aritz Francoy";
            wellcome_div.appendChild(author);

            const contributors = document.createElement("p");
            contributors.textContent = "Contributors: Sergio Alvaro Panizo, Eduardo Valladolid, Mohammed Suhel";
            wellcome_div.appendChild(contributors);
            this.target.appendChild(wellcome_div);

            this.errorDiv = document.createElement("div");
            this.errorDiv.id = "tree_error_div";
            this.errorDiv.style.display = "none";
            this.errorDiv.style.padding = "8px";
            this.errorDiv.style.color = "#b00020";
            this.errorDiv.style.fontSize = "12px";
            this.target.appendChild(this.errorDiv);
                
        }
        
        private isResizing :boolean = false;       
        public update(options: VisualUpdateOptions) {
            if (!options || !options.dataViews || !options.dataViews[0] || !options.dataViews[0].metadata || !options.dataViews[0].metadata.columns) {
                return;
            }
            this.settings = Visual.parseSettings(options && options.dataViews && options.dataViews[0]);
            
            var div_height = this.target.offsetHeight, div_width = this.target.offsetWidth;
            var hasCategories = false;
            for(var i =0; i< options.dataViews[0].metadata.columns.length; i++){
                hasCategories = !options.dataViews[0].metadata.columns[i].isMeasure;
                if(hasCategories)break;
            } 
            
            if(hasCategories){
                if (options.type == 4) this.isResizing = true;
                if (options.type == 36) this.isResizing = false;

                document.getElementById("wellcome_div").style.display="none";
                if (this.errorDiv) this.errorDiv.style.display = "none";
                if(div_height-20>0)div_height=div_height-20;
                try {
                    inicializarArbol(div_height,div_width,options,this.host,this.settings,this.idDiv);
                } catch (e) {
                    if (d3.select("svg")){
                        d3.select("svg").remove();
                    }
                    try {
                        this.renderFallbackTree(options, div_height, div_width);
                    } catch (fallbackError) {
                        if (this.errorDiv) {
                            this.errorDiv.textContent = "Render error: " + ((fallbackError && (fallbackError as any).message) ? (fallbackError as any).message : fallbackError);
                            this.errorDiv.style.display = "block";
                        }
                    }
                    if (this.errorDiv) {
                        this.errorDiv.textContent = "Primary renderer unavailable. Showing fallback tree.";
                        this.errorDiv.style.display = "block";
                    }
                }
            } else {
                if (d3.select("svg")){
                    d3.select("svg").remove();
                }
                document.getElementById("wellcome_div").style.display="block";
            }
            
        }

        private static parseSettings(dataView: DataView): VisualSettings {
            return VisualSettings.parse(dataView) as VisualSettings;
        }

        /** 
         * This function gets called for each of the objects defined in the capabilities files and allows you to select which of the 
         * objects and properties you want to expose to the users in the property pane.
         * 
         */
        public enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions): VisualObjectInstance[] | VisualObjectInstanceEnumerationObject {
            const vSettings:VisualSettings=this.settings || VisualSettings.getDefault() as VisualSettings
            
            return VisualSettings.enumerateObjectInstances(vSettings,options);
        }
    }
