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

module powerbi.extensibility.visual.testTooltip4696B540F3494FE5BA002362825DDE7D_DEBUG  {
    "use strict";
    import tooltip = powerbi.extensibility.utils.tooltip;
    

    interface ITooltipServiceWrapper {
        addTooltip<T>(selection: d3.Selection<any>, getTooltipInfoDelegate: (args: TooltipEventArgs<T>) => VisualTooltipDataItem[], getDataPointIdentity?: (args: TooltipEventArgs<T>) => ISelectionId, reloadTooltipDataOnMouseMove?: boolean): void;
        hide(): void;
    }

    //import tooltip = powerbi.extensibility.utils.tooltip;
    import TooltipEnabledDataPoint = powerbi.extensibility.utils.tooltip.TooltipEnabledDataPoint;
    import TooltipEventArgs = powerbi.extensibility.utils.tooltip.TooltipEventArgs;

    import IColorPalette = powerbi.extensibility.IColorPalette;
    


    function callTreeInitializer(height: number, width: number, options: any, host: any, settings: any, idDiv: string): void {
        const root: any = (typeof globalThis !== "undefined") ? globalThis : (typeof window !== "undefined" ? window : {});
        const initFn: any = root["inicializarArbol"] || root["inicialzorArbol"];
        if (typeof initFn !== "function") {
            throw new Error("Tree initializer is not loaded");
        }
        initFn(height, width, options, host, settings, idDiv);
    }

    export class Visual implements IVisual {
        
        private host: IVisualHost;
        private tooltipServiceWrapper: ITooltipServiceWrapper; 
        private target: HTMLElement;
        private updateCount: number;
        private settings: VisualSettings;
        private textNode: Text;
        private colorPalete: IColorPalette;
        private idDiv: string;
        private oldOptions: VisualUpdateOptions;
        private errorDiv: HTMLElement;

        
        

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
            wellcome_div.innerHTML="<p style='font-size:25px'>PIE CHARTS TREE (1.0.3)</p>";
            wellcome_div.innerHTML+="<p style='font-weight: bolder;'>Put an attribute in the Categories field to start the tree...<br/></p>";
            wellcome_div.innerHTML+="<p>Created by Aritz Francoy</p>";
            wellcome_div.innerHTML+="<p>Contributors: Sergio Alvaro Panizo, Eduardo Valladolid, Mohammed Suhel</p>";
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
                    callTreeInitializer(div_height,div_width,options,this.host,this.settings,this.idDiv);
                } catch (e) {
                    if (d3.select("svg")){
                        d3.select("svg").remove();
                    }
                    if (this.errorDiv) {
                        this.errorDiv.textContent = "Render error: " + ((e && e.message) ? e.message : e);
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
}