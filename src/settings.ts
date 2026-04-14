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

    public static parse(dataView: any): VisualSettings {
        return VisualSettings.getDefault();
    }

    public static getDefault(): VisualSettings {
        return new VisualSettings();
    }

    public static enumerateObjectInstances(settings: VisualSettings, options: any): any {
        return [];
    }
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
