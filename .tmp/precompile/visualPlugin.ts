import { Visual } from "../../src/settings";
import powerbiVisualsApi from "powerbi-visuals-api";
import IVisualPlugin = powerbiVisualsApi.visuals.plugins.IVisualPlugin;
import VisualConstructorOptions = powerbiVisualsApi.extensibility.visual.VisualConstructorOptions;
import DialogConstructorOptions = powerbiVisualsApi.extensibility.visual.DialogConstructorOptions;
var powerbiKey: any = "powerbi";
var powerbi: any = window[powerbiKey];
var testTooltip4696B540F3494FE5BA002362825DDE7D_DEBUG: IVisualPlugin = {
    name: 'testTooltip4696B540F3494FE5BA002362825DDE7D_DEBUG',
    displayName: 'Pie Charts Tree',
    class: 'Visual',
    apiVersion: '4.7.0',
    create: (options?: VisualConstructorOptions) => {
        if (Visual) {
            return new Visual(options);
        }
        throw 'Visual instance not found';
    },
    createModalDialog: (dialogId: string, options: DialogConstructorOptions, initialState: object) => {
        const dialogRegistry = (<any>globalThis).dialogRegistry;
        if (dialogId in dialogRegistry) {
            new dialogRegistry[dialogId](options, initialState);
        }
    },
    custom: true
};
if (typeof powerbi !== "undefined") {
    powerbi.visuals = powerbi.visuals || {};
    powerbi.visuals.plugins = powerbi.visuals.plugins || {};
    powerbi.visuals.plugins["testTooltip4696B540F3494FE5BA002362825DDE7D_DEBUG"] = testTooltip4696B540F3494FE5BA002362825DDE7D_DEBUG;
}
export default testTooltip4696B540F3494FE5BA002362825DDE7D_DEBUG;