// In this file graph, Pivot.ts imports Pivot.base.ts. This means that the content
// of Pivot.base should occur in the bundle BEFORE Pivot. Instead, we see in the bundle
// output that Pivot occurs before PivotBase, causing a null reference.
//
// This seems related to the order which things are exported here. We're saying here to
// export Pivot, PivotItem, and then PivotBase. In a no-side-effects situation, the order
// in which we export should not matter. However, the order in which we import definitely
// matters. Things we import are things we're using now and cannot proceed until they have
// been defined or resolved.
//
// In other words, you should be able to change the order of these lines in any order and
// the output should still be consumable; that is, import order should define file content
// order far more so than export order.

export * from "@fluentui/react/lib/components/Pivot/Pivot";
export { PivotItem } from "@fluentui/react/lib/components/Pivot/PivotItem";

// Commenting this line out fixes the build. Also moving it to the top fixes.
export * from "@fluentui/react/lib/components/Pivot/Pivot.base";
