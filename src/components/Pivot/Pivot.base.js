import { __assign, __rest } from "tslib";
import * as React from "react";
import { useControllableValue, useId } from "@fluentui/react-hooks";
import {
  classNamesFunction,
  css,
  divProperties,
  getNativeProps,
  getRTL,
  KeyCodes,
  warn,
} from "@fluentui/utilities";
import { CommandButton } from "@fluentui/react/lib/Button";
import { useOverflow } from "@fluentui/react/lib/utilities/useOverflow";
import { FocusZone, FocusZoneDirection } from "@fluentui/react/lib/FocusZone";
import { DirectionalHint } from "@fluentui/react/lib/components/ContextualMenu/ContextualMenu.types";
import { Icon } from "@fluentui/react/lib/Icon";
import { PivotItem } from "./PivotItem";

var getClassNames = classNamesFunction();
var COMPONENT_NAME = "Pivot";
var getTabId = function (props, pivotId, itemKey, index) {
  if (props.getTabId) {
    return props.getTabId(itemKey, index);
  }
  return pivotId + ("-Tab" + index);
};
// Gets the set of PivotLinks as array of IPivotItemProps
// The set of Links is determined by child components of type PivotItem
var getLinkItems = function (props, pivotId) {
  var result = {
    links: [],
    keyToIndexMapping: {},
    keyToTabIdMapping: {},
  };
  React.Children.forEach(
    React.Children.toArray(props.children),
    function (child, index) {
      if (isPivotItem(child)) {
        // eslint-disable-next-line deprecation/deprecation
        var _a = child.props,
          linkText = _a.linkText,
          pivotItemProps = __rest(_a, ["linkText"]);
        var itemKey = child.props.itemKey || index.toString();
        result.links.push(
          __assign(__assign({ headerText: linkText }, pivotItemProps), {
            itemKey: itemKey,
          })
        );
        result.keyToIndexMapping[itemKey] = index;
        result.keyToTabIdMapping[itemKey] = getTabId(
          props,
          pivotId,
          itemKey,
          index
        );
      } else if (child) {
        warn(
          "The children of a Pivot component must be of type PivotItem to be rendered."
        );
      }
    }
  );
  return result;
};
var isPivotItem = function (item) {
  var _a, _b;
  return (
    ((_b = (_a = item) === null || _a === void 0 ? void 0 : _a.type) === null ||
    _b === void 0
      ? void 0
      : _b.name) === PivotItem.name
  );
};
export var PivotBase = React.forwardRef(function (props, ref) {
  var focusZoneRef = React.useRef(null);
  var overflowMenuButtonComponentRef = React.useRef(null);
  var pivotId = useId("Pivot");
  var _a = useControllableValue(props.selectedKey, props.defaultSelectedKey),
    selectedKey = _a[0],
    setSelectedKey = _a[1];
  var componentRef = props.componentRef,
    theme = props.theme,
    linkSize = props.linkSize,
    linkFormat = props.linkFormat,
    overflowBehavior = props.overflowBehavior;
  var classNames;
  var divProps = getNativeProps(props, divProperties);
  var linkCollection = getLinkItems(props, pivotId);
  React.useImperativeHandle(componentRef, function () {
    return {
      focus: function () {
        var _a;
        (_a = focusZoneRef.current) === null || _a === void 0
          ? void 0
          : _a.focus();
      },
    };
  });
  var renderLinkContent = function (link) {
    if (!link) {
      return null;
    }
    var itemCount = link.itemCount,
      itemIcon = link.itemIcon,
      headerText = link.headerText;
    return React.createElement(
      "span",
      { className: classNames.linkContent },
      itemIcon !== undefined &&
        React.createElement(
          "span",
          { className: classNames.icon },
          React.createElement(Icon, { iconName: itemIcon })
        ),
      headerText !== undefined &&
        React.createElement(
          "span",
          { className: classNames.text },
          " ",
          link.headerText
        ),
      itemCount !== undefined &&
        React.createElement(
          "span",
          { className: classNames.count },
          " (",
          itemCount,
          ")"
        )
    );
  };
  var renderPivotLink = function (
    renderLinkCollection,
    link,
    renderPivotLinkSelectedKey,
    className
  ) {
    var itemKey = link.itemKey,
      headerButtonProps = link.headerButtonProps,
      onRenderItemLink = link.onRenderItemLink;
    var tabId = renderLinkCollection.keyToTabIdMapping[itemKey];
    var linkContent;
    var isSelected = renderPivotLinkSelectedKey === itemKey;
    if (onRenderItemLink) {
      linkContent = onRenderItemLink(link, renderLinkContent);
    } else {
      linkContent = renderLinkContent(link);
    }
    var contentString = link.headerText || "";
    contentString += link.itemCount ? " (" + link.itemCount + ")" : "";
    // Adding space supplementary for icon
    contentString += link.itemIcon ? " xx" : "";
    return React.createElement(
      CommandButton,
      __assign({}, headerButtonProps, {
        id: tabId,
        key: itemKey,
        className: css(className, isSelected && classNames.linkIsSelected),
        // eslint-disable-next-line react/jsx-no-bind
        onClick: function (ev) {
          return onLinkClick(itemKey, ev);
        },
        // eslint-disable-next-line react/jsx-no-bind
        onKeyDown: function (ev) {
          return onKeyDown(itemKey, ev);
        },
        "aria-label": link.ariaLabel,
        role: link.role || "tab",
        "aria-selected": isSelected,
        name: link.headerText,
        keytipProps: link.keytipProps,
        "data-content": contentString,
      }),
      linkContent
    );
  };
  var onLinkClick = function (itemKey, ev) {
    ev.preventDefault();
    updateSelectedItem(itemKey, ev);
  };
  var onKeyDown = function (itemKey, ev) {
    // eslint-disable-next-line deprecation/deprecation
    if (ev.which === KeyCodes.enter) {
      ev.preventDefault();
      updateSelectedItem(itemKey);
    }
  };
  var updateSelectedItem = function (itemKey, ev) {
    var _a;
    setSelectedKey(itemKey);
    linkCollection = getLinkItems(props, pivotId);
    if (props.onLinkClick && linkCollection.keyToIndexMapping[itemKey] >= 0) {
      var selectedIndex = linkCollection.keyToIndexMapping[itemKey];
      var item = React.Children.toArray(props.children)[selectedIndex];
      if (isPivotItem(item)) {
        props.onLinkClick(item, ev);
      }
    }
    (_a = overflowMenuButtonComponentRef.current) === null || _a === void 0
      ? void 0
      : _a.dismissMenu();
  };
  var renderPivotItem = function (itemKey, isActive) {
    if (props.headersOnly || !itemKey) {
      return null;
    }
    var index = linkCollection.keyToIndexMapping[itemKey];
    var selectedTabId = linkCollection.keyToTabIdMapping[itemKey];
    return React.createElement(
      "div",
      {
        role: "tabpanel",
        hidden: !isActive,
        key: itemKey,
        "aria-hidden": !isActive,
        "aria-labelledby": selectedTabId,
        className: classNames.itemContainer,
      },
      React.Children.toArray(props.children)[index]
    );
  };
  var isKeyValid = function (itemKey) {
    return (
      itemKey === null ||
      (itemKey !== undefined &&
        linkCollection.keyToIndexMapping[itemKey] !== undefined)
    );
  };
  var getSelectedKey = function () {
    if (isKeyValid(selectedKey)) {
      return selectedKey;
    }
    if (linkCollection.links.length) {
      return linkCollection.links[0].itemKey;
    }
    return undefined;
  };
  classNames = getClassNames(props.styles, {
    theme: theme,
    linkSize: linkSize,
    linkFormat: linkFormat,
  });
  var renderedSelectedKey = getSelectedKey();
  var renderedSelectedIndex = renderedSelectedKey
    ? linkCollection.keyToIndexMapping[renderedSelectedKey]
    : 0;
  var items = linkCollection.links.map(function (l) {
    return renderPivotLink(
      linkCollection,
      l,
      renderedSelectedKey,
      classNames.link
    );
  });
  // The overflow menu starts empty and items[] is updated as the overflow items change
  var overflowMenuProps = React.useMemo(function () {
    return {
      items: [],
      alignTargetEdge: true,
      directionalHint: DirectionalHint.bottomRightEdge,
    };
  }, []);
  var overflowMenuButtonRef = useOverflow({
    onOverflowItemsChanged: function (overflowIndex, elements) {
      // Set data-is-overflowing on each item
      elements.forEach(function (_a) {
        var ele = _a.ele,
          isOverflowing = _a.isOverflowing;
        return (ele.dataset.isOverflowing = "" + isOverflowing);
      });
      // Update the menu items
      overflowMenuProps.items = linkCollection.links
        .slice(overflowIndex)
        .map(function (link, index) {
          return {
            key: link.itemKey || "" + (overflowIndex + index),
            onRender: function () {
              return renderPivotLink(
                linkCollection,
                link,
                renderedSelectedKey,
                classNames.linkInMenu
              );
            },
          };
        });
    },
    rtl: getRTL(theme),
    pinnedIndex: renderedSelectedIndex,
  }).menuButtonRef;
  return React.createElement(
    "div",
    __assign({ role: "toolbar" }, divProps, { ref: ref }),
    React.createElement(
      FocusZone,
      {
        componentRef: focusZoneRef,
        direction: FocusZoneDirection.horizontal,
        className: classNames.root,
        role: "tablist",
      },
      items,
      overflowBehavior === "menu" &&
        React.createElement(CommandButton, {
          className: css(classNames.link, classNames.overflowMenuButton),
          elementRef: overflowMenuButtonRef,
          componentRef: overflowMenuButtonComponentRef,
          menuProps: overflowMenuProps,
          menuIconProps: { iconName: "More", style: { color: "inherit" } },
        })
    ),
    renderedSelectedKey &&
      linkCollection.links.map(function (link) {
        return (
          (link.alwaysRender === true ||
            renderedSelectedKey === link.itemKey) &&
          renderPivotItem(link.itemKey, renderedSelectedKey === link.itemKey)
        );
      })
  );
});
PivotBase.displayName = COMPONENT_NAME;
//# sourceMappingURL=Pivot.base.js.map
