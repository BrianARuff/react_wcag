import React, {
  useContext,
  useRef,
  useState,
  useEffect,
  ReactNode,
  useMemo,
} from "react";
import { v4 } from "uuid";
import {
  ComboboxContextType,
  GridComboboxContext,
} from "./GridComboboxContext";

export type GridComboboxRenderContainerProps<C = any> = {
  children: ReactNode;
  context: ComboboxContextType<C>;
  handleSelectionChange: (value: any) => void;
  getActiveItem: () => any;
};

export type GridComboboxProps<T = any, C = any> = {
  children: ReactNode;
  value?: T | null;
  renderContainer?: (props: GridComboboxRenderContainerProps<C>) => ReactNode;
  onChange?: (value: T | null) => void;
  displayValue?: (value: T | null) => string;
};

export function GridCombobox<T = any, C = any>({
  children,
  value,
  onChange,
  renderContainer,
  displayValue = (value: T | null) => String(value ?? ""),
}: GridComboboxProps<T, C>) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(() => displayValue(value!));
  const [selectedValue, setSelectedValue] = useState<T | null>(value ?? null);
  const [filterText, setFilterText] = useState("");
  const [activePosition, setActivePosition] = useState({
    rowIndex: -1,
    cellIndex: 0,
  });
  const [totalRows, setTotalRows] = useState(0);
  const [columnsPerRow, setColumnsPerRow] = useState(1);
  const [visibleIndexes, setVisibleIndexes] = useState<number[]>([]);
  const [shouldOpenOnFocus, setShouldOpenOnFocus] = useState(true);
  const [isFirstKeyPress, setIsFirstKeyPress] = useState(true);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setInputValue(displayValue(value!));
    setSelectedValue(value ?? null);
  }, [value, displayValue]);

  const handleSelectionChange = (newValue: T | null) => {
    setSelectedValue(newValue);
    setInputValue(displayValue(newValue));
    setFilterText(""); // Reset filterText after selection
    onChange?.(newValue);
  };

  const getActiveItem = () => {
    let activeItem: T | null = null;
    React.Children.forEach(children, (child) => {
      if (React.isValidElement(child) && child.type === GridComboboxMenu) {
        React.Children.forEach(child.props.children, (menuItem, index) => {
          if (
            React.isValidElement(menuItem) &&
            index === activePosition.rowIndex
          ) {
            // @ts-ignore
            activeItem = menuItem.props.value;
          }
        });
      }
    });
    return activeItem;
  };

  const uid = useMemo(() => v4()?.replace(/\-/g, ""), []);

  const contextValue: ComboboxContextType = {
    isOpen,
    setIsOpen,
    inputValue,
    setInputValue,
    selectedValue,
    setSelectedValue: handleSelectionChange,
    activePosition,
    setActivePosition,
    totalRows,
    setTotalRows,
    columnsPerRow,
    setColumnsPerRow,
    filterText,
    setFilterText,
    getActiveItem,
    visibleIndexes,
    setVisibleIndexes,
    shouldOpenOnFocus,
    setShouldOpenOnFocus,
    isFirstKeyPress,
    setIsFirstKeyPress,
    inputRef,
    inputId: `comboboxInput${uid}`,
  };

  return (
    <GridComboboxContext.Provider value={contextValue}>
      {renderContainer ? (
        renderContainer({
          children,
          context: contextValue,
          handleSelectionChange,
          getActiveItem,
        })
      ) : (
        <div className="relative w-full">{children}</div>
      )}
    </GridComboboxContext.Provider>
  );
}

export type GridComboboRenderLabelProps<C = any> = {
  children: ReactNode;
  context: ComboboxContextType<C>;
};

export type GridComboboxLabelProps<C = any> = {
  id?: string;
  children?: ReactNode;
  renderLabel?: (props: GridComboboRenderLabelProps<C>) => ReactNode;
};

export function GridComboboxLabel<C = any>({
  children,
  id,
  renderLabel,
}: GridComboboxLabelProps<C>) {
  const context = useContext(GridComboboxContext) as ComboboxContextType<any>;

  return renderLabel ? (
    renderLabel({ children, context })
  ) : (
    <label
      id={id}
      htmlFor={context?.inputId}
      className="block text-sm font-medium text-gray-700"
    >
      {children}
    </label>
  );
}

export type GridComboboxInputRenderInputProps<C = any> = {
  menuId: string;
  labelId: string;
  placeholder: string;
  context: ComboboxContextType<C>;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  handleFocus: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

export type GridComboboxInputProps<C = any> = {
  labelId: string;
  menuId: string;
  placeholder?: string;
  renderInput?: (props: GridComboboxInputRenderInputProps<C>) => ReactNode;
};

export function GridComboboxInput<C = any>({
  labelId,
  menuId,
  renderInput,
  placeholder = "Type to search...",
}: GridComboboxInputProps<C>) {
  const context = useContext(GridComboboxContext);
  if (!context)
    throw new Error("GridComboboxInput must be used within GridCombobox");

  const {
    isOpen,
    setIsOpen,
    inputValue,
    setInputValue,
    setFilterText,
    activePosition,
    setActivePosition,
    setSelectedValue,
    getActiveItem,
    visibleIndexes,
    inputRef,
    shouldOpenOnFocus,
    setShouldOpenOnFocus,
    setIsFirstKeyPress,
    isFirstKeyPress,
    inputId,
  } = context as ComboboxContextType;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    setFilterText(value.trim());
    setIsOpen(true);
    setActivePosition({ rowIndex: -1, cellIndex: 0 });
    setIsFirstKeyPress(true);
    setShouldOpenOnFocus(true); // Reset shouldOpenOnFocus when the user types
  };

  const navigateList = (direction: "next" | "prev") => {
    if (visibleIndexes.length === 0) return;

    if (!isOpen) {
      setIsOpen(true);
    }

    if (activePosition.rowIndex === -1 || isFirstKeyPress) {
      const newIndex = direction === "next" ? 0 : visibleIndexes.length - 1;
      setActivePosition({ rowIndex: visibleIndexes[newIndex], cellIndex: 0 });
      setIsFirstKeyPress(false);
    } else {
      const currentPosition = visibleIndexes.indexOf(activePosition.rowIndex);
      if (currentPosition === -1) {
        const newRowIndex =
          direction === "next"
            ? visibleIndexes[0]
            : visibleIndexes[visibleIndexes.length - 1];
        setActivePosition({ rowIndex: newRowIndex, cellIndex: 0 });
      } else {
        const offset = direction === "next" ? 1 : -1;
        const newPosition =
          (currentPosition + offset + visibleIndexes.length) %
          visibleIndexes.length;
        setActivePosition({
          rowIndex: visibleIndexes[newPosition],
          cellIndex: 0,
        });
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (visibleIndexes.length === 0 && e.key !== "Escape") {
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        navigateList("next");
        break;

      case "ArrowUp":
        e.preventDefault();
        navigateList("prev");
        break;

      case "ArrowRight":
      case "ArrowLeft":
        // Do not prevent default; allow event to propagate
        break;

      case "Enter":
        e.preventDefault();
        if (isOpen && activePosition.rowIndex >= 0) {
          const selectedItem = getActiveItem();
          if (selectedItem !== null) {
            setSelectedValue(selectedItem);
            setIsOpen(false);
            setActivePosition({ rowIndex: -1, cellIndex: 0 });
            setIsFirstKeyPress(true);
            setShouldOpenOnFocus(false);
            if (inputRef.current) {
              inputRef.current.focus();
            }
          }
        } else if (!isOpen && inputValue.trim()) {
          setIsOpen(true);
        }
        break;

      case "Tab":
        // Close the menu and allow focus to move to the next element
        setIsOpen(false);
        setActivePosition({ rowIndex: -1, cellIndex: 0 });
        setIsFirstKeyPress(true);
        // Do not prevent default to allow normal tabbing
        break;

      case "Escape":
        e.preventDefault();
        setIsOpen(false);
        setActivePosition({ rowIndex: -1, cellIndex: 0 });
        setIsFirstKeyPress(true);
        break;
    }
  };

  useEffect(() => {
    if (!isOpen) {
      setIsFirstKeyPress(true);
      setActivePosition({ rowIndex: -1, cellIndex: 0 });
    }
  }, [isOpen, setActivePosition]);

  useEffect(() => {
    if (activePosition.rowIndex >= 0 && isOpen) {
      const element = document.getElementById(
        `option-${activePosition.rowIndex}-${activePosition.cellIndex}`
      );
      if (element) {
        element.scrollIntoView({ block: "nearest" });
      }
    }
  }, [activePosition, isOpen]);

  const handleFocus = () => {
    if (inputValue.trim() && shouldOpenOnFocus) {
      setIsOpen(true);
      // Reset the flag for future interactions
      setShouldOpenOnFocus(true);
    }
    // Do not reset shouldOpenOnFocus if it's false
  };

  if (renderInput) {
    return renderInput({
      context: context as ComboboxContextType,
      labelId,
      menuId,
      placeholder,
      handleFocus,
      handleKeyDown,
      handleInputChange,
    });
  }

  return (
    <input
      ref={inputRef}
      type="text"
      id={inputId}
      role="combobox"
      aria-expanded={isOpen}
      aria-controls={menuId}
      aria-labelledby={labelId}
      aria-activedescendant={
        activePosition.rowIndex >= 0
          ? `option-${activePosition.rowIndex}-${activePosition.cellIndex}`
          : undefined
      }
      value={inputValue}
      onChange={handleInputChange}
      onKeyDown={handleKeyDown}
      onFocus={handleFocus}
      placeholder={placeholder}
      className={`w-full ${
        isOpen ? "border-blue-500 border-2" : ""
      } p-2 border-2 border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500`}
    />
  );
}

export type GridComboboxRenderMenuProps<C = any> = {
  context: ComboboxContextType<C>;
  inputWidth?: number;
  children?: ReactNode;
};

export type GridComboboxMenuProps<C = any> = {
  id: string;
  children?: ReactNode;
  renderMenu?: (props: GridComboboxRenderMenuProps<C>) => ReactNode;
};

export function GridComboboxMenu<C = any>({
  id,
  children,
  renderMenu,
}: GridComboboxMenuProps<C>) {
  const context = useContext(GridComboboxContext);
  if (!context)
    throw new Error("GridComboboxMenu must be used within GridCombobox");

  const {
    isOpen,
    setTotalRows,
    setIsOpen,
    setVisibleIndexes,
    filterText,
    inputRef,
    selectedValue,
  } = context as ComboboxContextType;

  useEffect(() => {
    const updateVisibleIndexes = () => {
      const newVisibleIndexes: number[] = [];

      React.Children.forEach(children, (child, index) => {
        if (React.isValidElement(child)) {
          const filterValue = child.props.filterValue;
          if (
            !filterText ||
            !filterValue ||
            filterValue.toLowerCase().includes(filterText.toLowerCase().trim())
          ) {
            newVisibleIndexes.push(index);
          }
        }
      });

      setVisibleIndexes(newVisibleIndexes);
      setTotalRows(newVisibleIndexes.length);
    };

    updateVisibleIndexes();
  }, [children, filterText, setTotalRows, setVisibleIndexes]);

  useEffect(() => {
    const doesSelectedValueMatchTextInput = Object.entries(
      selectedValue ?? {}
    )?.some(([, value]) => {
      const isSelectedValueMatchingTextInput =
        typeof value !== "string"
          ? String(value)?.toLocaleLowerCase?.() ===
            inputRef?.current?.value?.toLocaleLowerCase()
          : value?.toLocaleLowerCase() ===
              inputRef?.current?.value?.toLocaleLowerCase() &&
            inputRef?.current?.value?.replace(" ", "")?.length;

      return isSelectedValueMatchingTextInput;
    });
    if (doesSelectedValueMatchTextInput) {
      setIsOpen(false);
    }
  }, [selectedValue]);

  if (!isOpen) return null;

  if (renderMenu) {
    return renderMenu({
      children,
      context: context as ComboboxContextType,
      inputWidth: inputRef?.current?.getBoundingClientRect().width,
    });
  }

  return (
    <div
      id={id}
      role="grid"
      style={{
        width: inputRef?.current?.getBoundingClientRect().width + "px",
      }}
      className="fixed z-50  mt-1 bg-white border border-gray-300 rounded shadow-lg max-h-60 overflow-auto"
      aria-label="Search suggestions"
    >
      {children}
    </div>
  );
}

export type GridComboboxRenderMenuItemProps<C = any> = {
  context: ComboboxContextType<C>;
  isActiveRow: boolean;
  children?: ReactNode;
  RowContainer: (props: { renderNode: ReactNode }) => ReactNode;
  handleSelect: () => void;
  handleKeyDown: (e: React.KeyboardEvent) => void;
};

export type GridComboboxMenuItemProps<T = any, C = any> = {
  children: ReactNode;
  index: number;
  value: T;
  filterValue?: string;
  renderMenuItem?: (props: GridComboboxRenderMenuItemProps<C>) => ReactNode;
};

export function GridComboboxMenuItem<T = any, C = any>({
  children,
  index,
  value,
  filterValue,
  renderMenuItem,
}: GridComboboxMenuItemProps<T, C>) {
  const context = useContext(GridComboboxContext);
  if (!context)
    throw new Error("GridComboboxMenuItem must be used within GridCombobox");

  const {
    activePosition,
    setActivePosition,
    setSelectedValue,
    setIsOpen,
    isOpen,
    filterText,
    visibleIndexes,
    columnsPerRow,
    setColumnsPerRow,
    inputRef,
    setShouldOpenOnFocus,
    setIsFirstKeyPress,
    setFilterText,
  } = context as ComboboxContextType;

  const isActiveRow = activePosition.rowIndex === index;

  const handleSelect = () => {
    setSelectedValue(value);
    setFilterText(""); // Reset filterText after selection
    setIsOpen(false);
    setActivePosition({ rowIndex: -1, cellIndex: 0 });
    setShouldOpenOnFocus(false); // Prevent menu from reopening on focus
    // Focus the input field
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const nextRowIndex =
      (visibleIndexes.indexOf(index) + 1) % visibleIndexes.length;

    const prevRowIndex =
      (visibleIndexes.indexOf(index) - 1 + visibleIndexes.length) %
      visibleIndexes.length;

    switch (e.key) {
      case "ArrowRight":
        e.preventDefault();
        setActivePosition((prev) => ({
          ...prev,
          cellIndex: (prev.cellIndex + 1) % columnsPerRow,
        }));
        break;

      case "ArrowLeft":
        e.preventDefault();
        setActivePosition((prev) => ({
          ...prev,
          cellIndex: (prev.cellIndex - 1 + columnsPerRow) % columnsPerRow,
        }));
        break;

      case "ArrowDown":
        e.preventDefault();

        setActivePosition({
          rowIndex: visibleIndexes[nextRowIndex],
          cellIndex: activePosition.cellIndex,
        });
        break;

      case "ArrowUp":
        e.preventDefault();

        setActivePosition({
          rowIndex: visibleIndexes[prevRowIndex],
          cellIndex: activePosition.cellIndex,
        });
        break;

      case "Enter":
      case " ":
        e.preventDefault();
        handleSelect();
        break;

      case "Escape":
        e.preventDefault();
        setIsOpen(false);
        setActivePosition({ rowIndex: -1, cellIndex: 0 });
        setIsFirstKeyPress(true);
        inputRef?.current?.focus?.();
        break;

      case "Tab":
        // Close the menu and allow focus to move to the next element
        setIsOpen(false);
        setActivePosition({ rowIndex: -1, cellIndex: 0 });
        break;
    }
  };

  useEffect(() => {
    // Set columnsPerRow based on the number of children
    if (React.Children.count(children) > 0) {
      setColumnsPerRow(React.Children.count(children));
    }
  }, [children, setColumnsPerRow]);

  useEffect(() => {
    if (activePosition.rowIndex === index && isOpen) {
      const activeElement = document.getElementById(
        `option-${activePosition.rowIndex}-${activePosition.cellIndex}`
      );
      if (activeElement) {
        activeElement.focus();
      }
    }
  }, [activePosition, index, isOpen]);

  if (filterText && filterValue) {
    const normalizedFilter = filterText.toLowerCase().trim();
    const normalizedValue = filterValue.toLowerCase().trim();

    if (!normalizedValue.includes(normalizedFilter)) {
      return null;
    }
  }

  if (renderMenuItem) {
    return renderMenuItem({
      RowContainer: (props) => props.renderNode,
      context: context as ComboboxContextType,
      children,
      isActiveRow,
      handleSelect,
      handleKeyDown,
    });
  }

  return (
    <div
      role="row"
      className={`flex hover:bg-blue-100 ${isActiveRow ? "bg-blue-100" : ""}`}
    >
      {React.Children.map(children, (child, cellIndex) => (
        <div
          role="gridcell"
          id={`option-${index}-${cellIndex}`}
          tabIndex={-1}
          className={`flex-1 cursor-pointer p-2 ${
            activePosition.rowIndex === index &&
            activePosition.cellIndex === cellIndex
              ? "outline outline-2 -outline-offset-2 outline-blue-500"
              : ""
          }`}
          onClick={handleSelect}
          onFocus={() => {
            setActivePosition({ rowIndex: index, cellIndex });
          }}
          onKeyDown={(e) => handleKeyDown(e)}
        >
          {child}
        </div>
      ))}
    </div>
  );
}
