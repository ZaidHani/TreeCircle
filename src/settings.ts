/// <reference path="./powerbi-ambient.d.ts" />
/*
 *  Power BI Visualizations
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

export class VisualSettings {
    public treeOptions: treeOptions = new treeOptions();
    public treeLabels: treeLabels = new treeLabels();
    public treeColors: treeColors = new treeColors();
    public legend: legend = new legend();

    public static parse(dataView: any): VisualSettings {
        return VisualSettings.getDefault();
    }

    public static getDefault(): VisualSettings {
        return new VisualSettings();
    }

    public static enumerateObjectInstances(settings: VisualSettings, options: any): any {
        const objectName = options && options.objectName ? options.objectName : "";
        switch (objectName) {
            case "treeOptions":
                return [{
                    objectName: "treeOptions",
                    properties: {
                        treeStyle: settings.treeOptions.treeStyle,
                        filterMode: settings.treeOptions.filterMode,
                        initialMode: settings.treeOptions.initialMode,
                        weightLinks: settings.treeOptions.weightLinks,
                        linksSize: settings.treeOptions.linksSize,
                        linksOpacity: settings.treeOptions.linksOpacity,
                        nodesTooltips: settings.treeOptions.nodesTooltips,
                        expandMode: settings.treeOptions.expandMode,
                        translationsDuration: settings.treeOptions.translationsDuration,
                        leftMarginFirstNode: settings.treeOptions.leftMarginFirstNode,
                        rightMarginFirstNode: settings.treeOptions.rightMarginFirstNode,
                        topMarginFirstNode: settings.treeOptions.topMarginFirstNode,
                        bottomMarginFirstNode: settings.treeOptions.bottomMarginFirstNode,
                        progressPie: settings.treeOptions.progressPie
                    },
                    selector: null
                }];
            case "treeLabels":
                return [{
                    objectName: "treeLabels",
                    properties: {
                        allMemberName: settings.treeLabels.allMemberName,
                        nodeTextSize: settings.treeLabels.nodeTextSize,
                        magicLabels: settings.treeLabels.magicLabels,
                        autoScaleValues: settings.treeLabels.autoScaleValues,
                        valueAsPercent: settings.treeLabels.valueAsPercent,
                        numberDecimals: settings.treeLabels.numberDecimals,
                        categoryLabelXpos: settings.treeLabels.categoryLabelXpos,
                        categoryLabelYpos: settings.treeLabels.categoryLabelYpos,
                        valueLabelXpos: settings.treeLabels.valueLabelXpos,
                        valueLabelYpos: settings.treeLabels.valueLabelYpos,
                        backgroundLabels: settings.treeLabels.backgroundLabels
                    },
                    selector: null
                }];
            case "treeColors":
                return [{
                    objectName: "treeColors",
                    properties: {
                        arcBaseColor: { solid: { color: settings.treeColors.arcBaseColor } },
                        arcCumplimientoOK: { solid: { color: settings.treeColors.arcCumplimientoOK } },
                        arcCumplimientoKO: { solid: { color: settings.treeColors.arcCumplimientoKO } },
                        linkColorSeries: settings.treeColors.linkColorSeries,
                        linkColor: { solid: { color: settings.treeColors.linkColor } },
                        nodeColorSeries: settings.treeColors.nodeColorSeries,
                        nodeBgColor: { solid: { color: settings.treeColors.nodeBgColor } }
                    },
                    selector: null
                }];
            case "legend":
                return [{
                    objectName: "legend",
                    properties: {
                        enableLegend: settings.legend.enableLegend,
                        legendPosition: settings.legend.legendPosition,
                        legendFontSize: settings.legend.legendFontSize,
                        legendItemSpacing: settings.legend.legendItemSpacing
                    },
                    selector: null
                }];
            default:
                return [];
        }
    }
}

export class legend {
    public enableLegend: boolean = true;
    public legendPosition: string = "top-left";
    public legendFontSize: number = 12;
    public legendItemSpacing: number = 20;
}

export class treeLabels {
    public allMemberName: string = "All";
    public nodeTextSize: number = 15;
    public magicLabels: boolean = false;
    public autoScaleValues: boolean = true;
    public valueAsPercent: boolean = false;
    public numberDecimals: number = 2;
    public categoryLabelXpos: number = -30;
    public categoryLabelYpos: number = 0;
    public valueLabelXpos: number = 70;
    public valueLabelYpos: number = 0;
    public backgroundLabels: boolean = true;
}

export class treeColors {
    public arcBaseColor: string = "lightsteelblue";
    public arcCumplimientoOK: string = "green";
    public arcCumplimientoKO: string = "red";
    public linkColor: string = "lightgray";
    public linkColorSeries: boolean = true;
    public nodeColorSeries: boolean = true;
    public nodeBgColor: string = "white";
}

export enum treeStileOptions {
    horizontal = "horizontal" as any,
    vertical = "vertical" as any
}

export enum initialModeOptions {
    expanded = "expanded" as any,
    collapsed = "collapsed" as any,
    expandrednodes = "expandrednodes" as any,
    expandbestnode = "expandbestnode" as any,
    expandlownode = "expandlownode" as any
}

export class treeOptions {
    public treeStyle: treeStileOptions = treeStileOptions.horizontal;
    public filterMode: boolean = false;
    public initialMode: initialModeOptions = initialModeOptions.expanded;

    public weightLinks: boolean = true;
    public linksSize: number = 20;
    public linksOpacity: number = 0.5;
    public nodesTooltips: boolean = true;
    public expandMode: boolean = false;

    public translationsDuration: number = 750;

    public leftMarginFirstNode: number = 60;
    public rightMarginFirstNode: number = 80;
    public topMarginFirstNode: number = 20;
    public bottomMarginFirstNode: number = 60;

    public progressPie: boolean = true;
}
