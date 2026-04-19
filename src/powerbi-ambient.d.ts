declare namespace powerbi {
    interface DataView {}

    interface DataViewObjects {
        [name: string]: any;
    }

    interface DataViewObject {
        [propertyName: string]: any;
    }

    interface DataViewCategoryColumn {
        objects?: DataViewObject[];
    }

    namespace visuals {
        interface ISelectionId {}
        interface VisualObjectInstance {}
        interface VisualObjectInstanceEnumerationObject {}
        interface EnumerateVisualObjectInstancesOptions {}
    }

    namespace extensibility {
        interface IVisual {}
        interface IVisualHost {}
        interface IColorPalette {}

        interface VisualTooltipDataItem {
            displayName: string;
            value: string;
            color?: string;
            header?: string;
            opacity?: string;
        }

        interface ITooltipService {
            enabled(): boolean;
            show(options: any): void;
            move(options: any): void;
            hide(options: any): void;
        }

        interface VisualUpdateOptions {
            type?: number;
            dataViews?: any[];
        }

        interface VisualConstructorOptions {
            element: HTMLElement;
            host: IVisualHost;
        }

        namespace utils {
            namespace dataview {
                class DataViewObjectsParser {
                    static parse(dataView: DataView): any;
                    static enumerateObjectInstances(settings: any, options: any): any;
                    static getDefault(): any;
                }
            }

            namespace tooltip {
                interface TooltipEventArgs<TData> {
                    data: TData;
                    coordinates: number[];
                    elementCoordinates: number[];
                    context: HTMLElement;
                    isTouchEvent: boolean;
                }

                interface TooltipEnabledDataPoint {
                    tooltipInfo?: VisualTooltipDataItem[];
                }
            }
        }

        namespace visual {
            interface IVisual extends extensibility.IVisual {}
            interface IVisualHost extends extensibility.IVisualHost {}
            interface VisualUpdateOptions extends extensibility.VisualUpdateOptions {}
            interface VisualConstructorOptions extends extensibility.VisualConstructorOptions {}
        }
    }
}
