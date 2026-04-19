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
        private fallbackRoot: any;
        private fallbackDataKey: string;

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

        private isMissingStepValue(rawValue: any): boolean {
            return rawValue === null || rawValue === undefined || (typeof rawValue === "string" && rawValue.trim() === "");
        }
        
        private buildTreeFromCategories(options: VisualUpdateOptions): any {
            const root: any = { name: "All", category: "Root", children: [] as any[], depth: 0, count: 0, value: 0, hasValue: false };
            const dv = options && options.dataViews && options.dataViews[0];
            if (!dv || !dv.categorical || !dv.categorical.categories || dv.categorical.categories.length === 0) {
                return root;
            }

            const categories = dv.categorical.categories;
            const values = dv.categorical.values || [];
            const rowCount = categories[0] && categories[0].values ? categories[0].values.length : 0;

            for (let r = 0; r < rowCount; r++) {
                let current = root;
                current.count += 1;
                const rowValueRaw = values[0] && values[0].values ? values[0].values[r] : null;
                const rowValue = rowValueRaw === null || rowValueRaw === undefined || rowValueRaw === ""
                    ? null
                    : Number(rowValueRaw);
                const rowHasValue = rowValue !== null && rowValue !== undefined && !Number.isNaN(rowValue);
                if (!current.value) {
                    current.value = 0;
                }
                if (rowHasValue) {
                    current.value += rowValue;
                }
                current.hasValue = current.hasValue || rowHasValue;

                for (let c = 0; c < categories.length; c++) {
                    const cat = categories[c];
                    const rawValue = cat.values ? cat.values[r] : null;
                    // Skip empty/null step values and continue to following steps.
                    if (this.isMissingStepValue(rawValue)) {
                        continue;
                    }
                    const label = String(rawValue);
                    let child = current.children.find((x: any) => x.name === label && x.category === cat.source.displayName);
                    if (!child) {
                        child = {
                            name: label,
                            category: cat.source.displayName,
                            children: [],
                            depth: c + 1,
                            count: 0,
                            value: 0,
                            hasValue: false
                        };
                        current.children.push(child);
                    }
                    child.count += 1;
                    if (rowHasValue) {
                        child.value += rowValue;
                        child.hasValue = true;
                    }
                    current = child;
                }
            }

            return root;
        }

        private getFallbackDataKey(options: VisualUpdateOptions): string {
            const dv = options && options.dataViews && options.dataViews[0];
            if (!dv || !dv.categorical || !dv.categorical.categories) return "no-data";
            const categories = dv.categorical.categories;
            const keyParts: string[] = [String(categories.length)];
            categories.forEach((c: any) => {
                keyParts.push(String(c.source && c.source.displayName ? c.source.displayName : ""));
                keyParts.push(String(c.values ? c.values.length : 0));
            });
            return keyParts.join("|");
        }

        private renderFallbackLegend(
            svgRoot: d3.Selection<any>,
            categories: any[],
            categoryColors: { [key: string]: string },
            activeCategory: string | null,
            onToggle: (category: string | null) => void
        ): void {
            svgRoot.selectAll("g.fallback-legend").remove();
            if (!this.settings || !this.settings.legend || !this.settings.legend.enableLegend || !categories || categories.length === 0) return;

            const fontSize = Math.max(8, this.settings.legend.legendFontSize || 12);
            const spacing = Math.max(12, this.settings.legend.legendItemSpacing || 20);
            const items = categories.map((c: any, i: number) => ({
                category: c.source.displayName,
                label: c.source.displayName
            }));

            const width = Number(svgRoot.attr("width")) || 600;
            const height = Number(svgRoot.attr("height")) || 400;
            const boxWidth = 140;
            const boxHeight = items.length * spacing + 30;
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
                .style("fill-opacity", 0.92)
                .style("stroke", "#d0d0d0");

            g.append("text")
                .attr("x", x + 8)
                .attr("y", y + 14)
                .style("font-size", Math.max(9, fontSize - 1) + "px")
                .style("fill", "#666")
                .text(activeCategory ? "Filter: " + activeCategory : "Filter: all");

            const rows = g.selectAll("g.legend-row")
                .data(items)
                .enter()
                .append("g")
                .attr("class", "legend-row")
                .style("cursor", "pointer")
                .attr("transform", (d: any, i: number) => "translate(" + (x + 10) + "," + (y + 20 + i * spacing) + ")")
                .on("click", (d: any) => {
                    onToggle(activeCategory === d.category ? null : d.category);
                });

            rows.append("rect")
                .attr("x", 0)
                .attr("y", 0)
                .attr("width", 10)
                .attr("height", 10)
                .style("fill", (d: any) => categoryColors[d.category] || "#4C78A8");

            rows.append("text")
                .attr("x", 16)
                .attr("y", 9)
                .style("font-size", fontSize + "px")
                .style("fill", (d: any) => (activeCategory && activeCategory !== d.category) ? "#999" : "#333")
                .text((d: any) => d.label);
        }

        private renderFallbackTree(options: VisualUpdateOptions, height: number, width: number): void {
            const container = d3.select("#" + this.idDiv);
            container.select("svg").remove();

            const dv = options && options.dataViews && options.dataViews[0];
            const categories = dv && dv.categorical && dv.categorical.categories ? dv.categorical.categories : [];
            const dataKey = this.getFallbackDataKey(options);
            if (!this.fallbackRoot || this.fallbackDataKey !== dataKey) {
                this.fallbackRoot = this.buildTreeFromCategories(options);
                this.fallbackDataKey = dataKey;
            }
            const data = this.fallbackRoot;
            // Allow user-configurable margins via settings.treeOptions, with an optional drawing padding to reduce whitespace.
            const tm = this.settings && this.settings.treeOptions ? this.settings.treeOptions : null;
            const pad = (tm && typeof tm.drawingPadding === 'number') ? tm.drawingPadding : 0;
            const leftDefault = (tm && typeof tm.leftMarginFirstNode === 'number') ? tm.leftMarginFirstNode : 120;
            const rightDefault = (tm && typeof tm.rightMarginFirstNode === 'number') ? tm.rightMarginFirstNode : 20;
            const topDefault = (tm && typeof tm.topMarginFirstNode === 'number') ? tm.topMarginFirstNode : 20;
            const bottomDefault = (tm && typeof tm.bottomMarginFirstNode === 'number') ? tm.bottomMarginFirstNode : 20;
            const margin = {
                top: Math.max(0, topDefault - pad),
                right: Math.max(0, rightDefault - pad),
                bottom: Math.max(0, bottomDefault - pad),
                left: Math.max(0, leftDefault - pad)
            };
            const w = Math.max(300, width - margin.left - margin.right);
            const h = Math.max(200, height - margin.top - margin.bottom);
            const nodeTextSize = Math.max(8, this.settings && this.settings.treeLabels ? this.settings.treeLabels.nodeTextSize : 12);
            const labelColor = this.settings && this.settings.treeLabels ? this.settings.treeLabels.labelColor : '#333333';
            const valueLabelColor = this.settings && this.settings.treeLabels ? this.settings.treeLabels.valueLabelColor : '#333333';
            const categoryLabelX = this.settings && this.settings.treeLabels ? this.settings.treeLabels.categoryLabelXpos : 0;
            const categoryLabelY = this.settings && this.settings.treeLabels ? this.settings.treeLabels.categoryLabelYpos : 0;
            const valueLabelX = this.settings && this.settings.treeLabels ? this.settings.treeLabels.valueLabelXpos : 0;
            const valueLabelY = this.settings && this.settings.treeLabels ? this.settings.treeLabels.valueLabelYpos : 0;
            const backgroundLabels = this.settings && this.settings.treeLabels ? this.settings.treeLabels.backgroundLabels : true;
            const labelBackgroundColor = this.settings && this.settings.treeLabels ? this.settings.treeLabels.labelBackgroundColor : '#ffffff';
            const labelBackgroundOpacity = this.settings && this.settings.treeLabels ? this.settings.treeLabels.labelBackgroundOpacity : 0.5;
            const linkOpacity = this.settings && this.settings.treeOptions ? this.settings.treeOptions.linksOpacity : 0.5;
            const linkSize = this.settings && this.settings.treeOptions ? this.settings.treeOptions.linksSize : 2;
            const weightLinks = this.settings && this.settings.treeOptions ? this.settings.treeOptions.weightLinks : true;
            const arcBaseColor = this.settings && this.settings.treeColors ? this.settings.treeColors.arcBaseColor : "lightsteelblue";
            const nodeBgColor = this.settings && this.settings.treeColors ? this.settings.treeColors.nodeBgColor : "#fff";
            const linkColor = this.settings && this.settings.treeColors ? this.settings.treeColors.linkColor : "#b5b5b5";
            const nodeColorSeries = this.settings && this.settings.treeColors ? this.settings.treeColors.nodeColorSeries : true;
            const linkColorSeries = this.settings && this.settings.treeColors ? this.settings.treeColors.linkColorSeries : true;
            const maxCount = Math.max(1, d3.max(this.flattenNodes(data), function(n: any) { return n.count || 1; }) as any);
            const animationDuration = Math.max(0, this.settings && this.settings.treeOptions ? this.settings.treeOptions.translationsDuration : 250);
            const categoryColors: { [key: string]: string } = {};
            categories.forEach((c: any) => {
                const key = c.source.displayName;
                if (!categoryColors[key]) {
                    categoryColors[key] = this.host.colorPalette.getColor("cat:" + key).value;
                }
            });
            let activeCategory: string | null = null;

            const tree = d3.layout.tree().size([h, w]);
            const diagonal = d3.svg.diagonal().projection(function(d: any) { return [d.y, d.x]; });

            const totalW = Math.max(w + margin.left + margin.right, 300);
            const totalH = Math.max(h + margin.top + margin.bottom, 200);
            const svgRoot = container
                .append("svg")
                .attr("width", "100%")
                .attr("height", "100%")
                .attr("viewBox", "0 0 " + totalW + " " + totalH)
                .attr("preserveAspectRatio", "xMinYMin meet");

            const svg = svgRoot
                .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

            let i = 0;
            data.x0 = h / 2;
            data.y0 = 0;

            const hideTooltip = () => {
                try {
                    this.host.tooltipService.hostServices.visualHostTooltipService.hide({
                        isTouchEvent: false,
                        immediately: true
                    });
                } catch (e) {}
            };

            const showTooltip = (d: any) => {
                try {
                    const evt: any = (d3 as any).event || {};
                    const items = [{
                        displayName: d.category || "Category",
                        value: d.name || "",
                        color: d.__seriesColor || arcBaseColor
                    }];
                    if (d.hasValue) {
                        items.push({
                            displayName: "Value",
                            value: String(d.value),
                            color: d.__seriesColor || arcBaseColor
                        });
                    }
                    this.host.tooltipService.hostServices.visualHostTooltipService.show({
                        coordinates: [evt.clientX || 0, evt.clientY || 0],
                        isTouchEvent: false,
                        dataItems: items,
                        identities: []
                    });
                } catch (e) {}
            };

            const click = (d: any) => {
                if (d.children && d.children.length) {
                    d._children = d.children;
                    d.children = [];
                } else if (d._children && d._children.length) {
                    d.children = d._children;
                    d._children = [];
                }
                update(d);
            };

            const update = (source: any) => {
                const nodes = tree.nodes(data).reverse();
                const links = tree.links(nodes);

                const maxDepth = Math.max(1, d3.max(nodes, function(n: any) { return n.depth || 0; }) as any);
                // Calculate maximum displayed label length at the deepest depth (includes value text)
                let maxLabelLen = 0;
                nodes.forEach((n: any) => {
                    if (n.depth === maxDepth) {
                        const label = this.truncateLabel(n.name, 24);
                        const text = n.hasValue ? `${label} (${n.value})` : label;
                        if (text && text.length > maxLabelLen) maxLabelLen = text.length;
                    }
                });
                const labelPixelWidth = Math.floor(maxLabelLen * nodeTextSize * 0.65) + 16;
                const availableW = w - 40 - labelPixelWidth;
                const perDepth = Math.max(40, Math.floor((availableW > 0 ? availableW : (w - 40)) / maxDepth));
                nodes.forEach((n: any) => { n.y = n.depth * perDepth; });

                // Ensure svg viewBox is wide enough to accommodate deepest labels
                try {
                    const neededW = margin.left + margin.right + perDepth * maxDepth + labelPixelWidth;
                    if (neededW > totalW) {
                        svgRoot.attr("viewBox", "0 0 " + neededW + " " + totalH);
                    }
                } catch (e) {}

                const node = svg.selectAll("g.node")
                    .data(nodes, function(d: any) { return d.id || (d.id = ++i); });

                const nodeEnter = node.enter().append("g")
                    .attr("class", "node")
                    .attr("transform", function() { return "translate(" + source.y0 + "," + source.x0 + ")"; })
                    .on("click", click)
                    .on("mouseover", showTooltip)
                    .on("mouseout", hideTooltip);

                nodeEnter.each((d: any) => {
                    if (!d.__seriesColor) {
                        d.__seriesColor = categoryColors[d.category] || arcBaseColor;
                    }
                });

                nodeEnter.append("title")
                    .text(function(d: any) { return d.name; });

                nodeEnter.append("circle")
                    .attr("r", function(d: any) {
                        if (!weightLinks) return 6;
                        return Math.max(4, (d.count / maxCount) * Math.max(6, linkSize * 0.6));
                    })
                    .style("fill", (d: any) => {
                        if (!nodeColorSeries || !d.name || d.category === "Root") return nodeBgColor;
                        return d.__seriesColor;
                    })
                    .style("stroke", arcBaseColor);

                nodeEnter.append("text")
                    .attr("dx", function(d: any) { return d.children && d.children.length ? -12 : 12; })
                    .attr("x", categoryLabelX)
                    .attr("y", categoryLabelY)
                    .attr("dy", ".35em")
                    .style("text-anchor", function(d: any) { return d.children && d.children.length ? "end" : "start"; })
                    .style("font-size", nodeTextSize + "px")
                    .style("fill", labelColor)
                    .text((d: any) => {
                        const label = this.truncateLabel(d.name, 24);
                        return label;
                    });

                nodeEnter.each(function(d: any) {
                    const el = d3.select(this);
                    const valueText = d.hasValue ? String(d.value) : "";
                    if (valueText) {
                        if (backgroundLabels) {
                            el.append("rect")
                                .attr("fill", labelBackgroundColor)
                                .attr("fill-opacity", labelBackgroundOpacity)
                                .attr("stroke", "none")
                                .attr("x", function() {
                                    const retorno = -valueText.length * nodeTextSize * 0.65 + valueLabelX + 10;
                                    return retorno;
                                })
                                .attr("y", valueLabelY - nodeTextSize / 2)
                                .attr("height", nodeTextSize)
                                .attr("width", Math.max(0, valueText.length * nodeTextSize * 0.65 - 8));
                        }
                        el.append("text")
                            .attr("x", valueLabelX)
                            .attr("y", valueLabelY)
                            .attr("dy", "0.35em")
                            .attr("text-anchor", function(d: any) { return d.children && d.children.length ? "end" : "start"; })
                            .text(valueText)
                            .style("fill", valueLabelColor)
                            .style("fill-opacity", 1)
                            .style("font-size", nodeTextSize + "px");
                    }
                });

                node.transition()
                    .duration(animationDuration)
                    .attr("transform", function(d: any) { return "translate(" + d.y + "," + d.x + ")"; })
                    .style("opacity", function(d: any) {
                        return !activeCategory || d.category === activeCategory || d.category === "Root" ? 1 : 0.2;
                    });

                node.exit().transition()
                    .duration(animationDuration)
                    .attr("transform", function() { return "translate(" + source.y + "," + source.x + ")"; })
                    .remove();

                const link = svg.selectAll("path.link")
                    .data(links, function(d: any) { return d.target.id; });

                link.enter().insert("path", "g")
                    .attr("class", "link")
                    .attr("d", function() {
                        const o = {x: source.x0, y: source.y0};
                        return diagonal({source: o, target: o});
                    })
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

                link.transition()
                    .duration(animationDuration)
                    .attr("d", diagonal)
                    .style("opacity", function(d: any) {
                        return !activeCategory || d.target.category === activeCategory ? 1 : 0.12;
                    });

                link.exit().transition()
                    .duration(animationDuration)
                    .attr("d", function() {
                        const o = {x: source.x, y: source.y};
                        return diagonal({source: o, target: o});
                    })
                    .remove();

                nodes.forEach(function(d: any) {
                    d.x0 = d.x;
                    d.y0 = d.y;
                });
            };

            const toggleCategory = (category: string | null) => {
                activeCategory = category;
                this.renderFallbackLegend(svgRoot, categories, categoryColors, activeCategory, toggleCategory);
                update(data);
            };
            this.renderFallbackLegend(svgRoot, categories, categoryColors, activeCategory, toggleCategory);
            update(data);
        }

        
        

        constructor(options: VisualConstructorOptions) {
            options.element.style.overflowX = "hidden";
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
                        // Keep UI clean: do not display technical errors in the visual.
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
