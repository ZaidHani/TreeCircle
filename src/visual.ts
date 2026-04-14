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
        
        private buildTreeFromCategories(options: VisualUpdateOptions): any {
            const root = { name: "All", category: "Root", children: [] as any[] };
            const dv = options && options.dataViews && options.dataViews[0];
            if (!dv || !dv.categorical || !dv.categorical.categories || dv.categorical.categories.length === 0) {
                return root;
            }

            const categories = dv.categorical.categories;
            const rowCount = categories[0] && categories[0].values ? categories[0].values.length : 0;

            for (let r = 0; r < rowCount; r++) {
                let current = root;
                for (let c = 0; c < categories.length; c++) {
                    const cat = categories[c];
                    const rawValue = cat.values ? cat.values[r] : null;
                    const label = (rawValue === null || rawValue === undefined) ? "(blank)" : String(rawValue);
                    let child = current.children.find((x: any) => x.name === label && x.category === cat.source.displayName);
                    if (!child) {
                        child = {
                            name: label,
                            category: cat.source.displayName,
                            children: []
                        };
                        current.children.push(child);
                    }
                    current = child;
                }
            }

            return root;
        }

        private renderFallbackTree(options: VisualUpdateOptions, height: number, width: number): void {
            const container = d3.select("#" + this.idDiv);
            container.select("svg").remove();

            const data = this.buildTreeFromCategories(options);
            const margin = { top: 20, right: 40, bottom: 20, left: 120 };
            const w = Math.max(300, width - margin.left - margin.right);
            const h = Math.max(200, height - margin.top - margin.bottom);

            const tree = d3.layout.tree().size([h, w]);
            const diagonal = d3.svg.diagonal().projection(function(d: any) { return [d.y, d.x]; });

            const svg = container
                .append("svg")
                .attr("width", w + margin.left + margin.right)
                .attr("height", h + margin.top + margin.bottom)
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
                .style("stroke", "#b5b5b5")
                .style("fill", "none");

            const node = svg.selectAll("g.node")
                .data(nodes)
                .enter()
                .append("g")
                .attr("class", "node")
                .attr("transform", function(d: any) { return "translate(" + d.y + "," + d.x + ")"; });

            node.append("circle")
                .attr("r", 6)
                .style("fill", "#fff")
                .style("stroke", "steelblue");

            node.append("text")
                .attr("dx", function(d: any) { return d.children && d.children.length ? -10 : 10; })
                .attr("dy", ".35em")
                .style("text-anchor", function(d: any) { return d.children && d.children.length ? "end" : "start"; })
                .style("font-size", "12px")
                .text(function(d: any) {
                    if (!d.category || d.category === "Root") return d.name;
                    return d.category + ": " + d.name;
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
