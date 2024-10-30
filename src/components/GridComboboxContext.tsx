import { createContext } from "react";

export type ComboboxContextType<T = any> = {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  inputValue: string;
  setInputValue: (value: string) => void;
  selectedValue: T | null;
  setSelectedValue: (value: T | null) => void;
  activePosition: { rowIndex: number; cellIndex: number };
  setActivePosition: React.Dispatch<
    React.SetStateAction<{ rowIndex: number; cellIndex: number }>
  >;
  totalRows: number;
  setTotalRows: (total: number) => void;
  columnsPerRow: number;
  setColumnsPerRow: (total: number) => void;
  filterText: string;
  setFilterText: (text: string) => void;
  getActiveItem: () => T | null;
  visibleIndexes: number[];
  setVisibleIndexes: (indexes: number[]) => void;
  shouldOpenOnFocus: boolean;
  setShouldOpenOnFocus: React.Dispatch<React.SetStateAction<boolean>>;
  isFirstKeyPress: boolean;
  inputId: string;
  setIsFirstKeyPress: React.Dispatch<React.SetStateAction<boolean>>;
  inputRef: React.RefObject<HTMLInputElement>;
};

export const GridComboboxContext =
  createContext<ComboboxContextType<any> | null>(null);
