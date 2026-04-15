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
        const settings = VisualSettings.getDefault();
        const objects = dataView && dataView.metadata ? dataView.metadata.objects : null;
        if (!objects) {
            return settings;
        }

        settings.treeOptions.treeStyle = getValue(objects, "treeOptions", "treeStyle", settings.treeOptions.treeStyle);
        settings.treeOptions.filterMode = getValue(objects, "treeOptions", "filterMode", settings.treeOptions.filterMode);
        settings.treeOptions.initialMode = getValue(objects, "treeOptions", "initialMode", settings.treeOptions.initialMode);
        settings.treeOptions.weightLinks = getValue(objects, "treeOptions", "weightLinks", settings.treeOptions.weightLinks);
        settings.treeOptions.linksSize = getValue(objects, "treeOptions", "linksSize", settings.treeOptions.linksSize);
        settings.treeOptions.linksOpacity = getValue(objects, "treeOptions", "linksOpacity", settings.treeOptions.linksOpacity);
        settings.treeOptions.nodesTooltips = getValue(objects, "treeOptions", "nodesTooltips", settings.treeOptions.nodesTooltips);
        settings.treeOptions.expandMode = getValue(objects, "treeOptions", "expandMode", settings.treeOptions.expandMode);
        settings.treeOptions.translationsDuration = getValue(objects, "treeOptions", "translationsDuration", settings.treeOptions.translationsDuration);
        settings.treeOptions.leftMarginFirstNode = getValue(objects, "treeOptions", "leftMarginFirstNode", settings.treeOptions.leftMarginFirstNode);
        settings.treeOptions.rightMarginFirstNode = getValue(objects, "treeOptions", "rightMarginFirstNode", settings.treeOptions.rightMarginFirstNode);
        settings.treeOptions.topMarginFirstNode = getValue(objects, "treeOptions", "topMarginFirstNode", settings.treeOptions.topMarginFirstNode);
        settings.treeOptions.bottomMarginFirstNode = getValue(objects, "treeOptions", "bottomMarginFirstNode", settings.treeOptions.bottomMarginFirstNode);
        settings.treeOptions.drawingPadding = getValue(objects, "treeOptions", "drawingPadding", settings.treeOptions.drawingPadding);
        settings.treeOptions.progressPie = getValue(objects, "treeOptions", "progressPie", settings.treeOptions.progressPie);

        settings.treeLabels.allMemberName = getValue(objects, "treeLabels", "allMemberName", settings.treeLabels.allMemberName);
        settings.treeLabels.nodeTextSize = getValue(objects, "treeLabels", "nodeTextSize", settings.treeLabels.nodeTextSize);
        settings.treeLabels.magicLabels = getValue(objects, "treeLabels", "magicLabels", settings.treeLabels.magicLabels);
        settings.treeLabels.autoScaleValues = getValue(objects, "treeLabels", "autoScaleValues", settings.treeLabels.autoScaleValues);
        settings.treeLabels.valueAsPercent = getValue(objects, "treeLabels", "valueAsPercent", settings.treeLabels.valueAsPercent);
        settings.treeLabels.numberDecimals = getValue(objects, "treeLabels", "numberDecimals", settings.treeLabels.numberDecimals);
        settings.treeLabels.categoryLabelXpos = getValue(objects, "treeLabels", "categoryLabelXpos", settings.treeLabels.categoryLabelXpos);
        settings.treeLabels.categoryLabelYpos = getValue(objects, "treeLabels", "categoryLabelYpos", settings.treeLabels.categoryLabelYpos);
        settings.treeLabels.valueLabelXpos = getValue(objects, "treeLabels", "valueLabelXpos", settings.treeLabels.valueLabelXpos);
        settings.treeLabels.valueLabelYpos = getValue(objects, "treeLabels", "valueLabelYpos", settings.treeLabels.valueLabelYpos);
        settings.treeLabels.backgroundLabels = getValue(objects, "treeLabels", "backgroundLabels", settings.treeLabels.backgroundLabels);

        settings.treeColors.arcBaseColor = getColor(objects, "treeColors", "arcBaseColor", settings.treeColors.arcBaseColor);
        settings.treeColors.arcCumplimientoOK = getColor(objects, "treeColors", "arcCumplimientoOK", settings.treeColors.arcCumplimientoOK);
        settings.treeColors.arcCumplimientoKO = getColor(objects, "treeColors", "arcCumplimientoKO", settings.treeColors.arcCumplimientoKO);
        settings.treeColors.linkColorSeries = getValue(objects, "treeColors", "linkColorSeries", settings.treeColors.linkColorSeries);
        settings.treeColors.linkColor = getColor(objects, "treeColors", "linkColor", settings.treeColors.linkColor);
        settings.treeColors.nodeColorSeries = getValue(objects, "treeColors", "nodeColorSeries", settings.treeColors.nodeColorSeries);
        settings.treeColors.nodeBgColor = getColor(objects, "treeColors", "nodeBgColor", settings.treeColors.nodeBgColor);

        settings.legend.enableLegend = getValue(objects, "legend", "enableLegend", settings.legend.enableLegend);
        settings.legend.legendPosition = getValue(objects, "legend", "legendPosition", settings.legend.legendPosition);
        settings.legend.legendFontSize = getValue(objects, "legend", "legendFontSize", settings.legend.legendFontSize);
        settings.legend.legendItemSpacing = getValue(objects, "legend", "legendItemSpacing", settings.legend.legendItemSpacing);

        return settings;
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
                        drawingPadding: settings.treeOptions.drawingPadding,
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

function getValue(objects: any, objectName: string, propertyName: string, defaultValue: any): any {
    try {
        if (!objects || !objects[objectName]) return defaultValue;
        const object = objects[objectName];
        if (object[propertyName] === undefined || object[propertyName] === null) return defaultValue;
        return object[propertyName];
    } catch (e) {
        return defaultValue;
    }
}

function getColor(objects: any, objectName: string, propertyName: string, defaultValue: string): string {
    const value = getValue(objects, objectName, propertyName, defaultValue);
    if (typeof value === "string") return value;
    if (value && value.solid && value.solid.color) return value.solid.color;
    return defaultValue;
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
    public drawingPadding: number = 0;

    public progressPie: boolean = true;
}
