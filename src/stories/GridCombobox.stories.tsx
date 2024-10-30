import { Meta, StoryFn } from "@storybook/react";
import {
  GridCombobox,
  GridComboboxInput,
  GridComboboxLabel,
  GridComboboxMenu,
  GridComboboxMenuItem,
} from "../components";
import React, { useId, useState } from "react";

export default {
  title: "Components/GridComboBox",
  component: GridCombobox,
  argTypes: {
    onOptionSelect: { action: "selected" },
  },
} as Meta<typeof GridCombobox>;

const Template: StoryFn<typeof GridCombobox> = () => {
  return (
    <>
      <div className="max-w-md mx-auto mt-10">
        {/* <DefaultExample /> */}
        <CustomExample />
      </div>
    </>
  );
};

export const Default = Template.bind({});

interface Product {
  id: number;
  name: string;
  category: string;
  price: string | number;
}

const products: Product[] = [
  {
    id: 1,
    name: "iPhone 13",
    category: "Smartphones",
    price: "$799",
  },
  {
    id: 2,
    name: "iPhone 13 Pro",
    category: "Smartphones",
    price: "$999",
  },
  {
    id: 3,
    name: "iPhone 13 Pro Max",
    category: "Smartphones",
    price: "$1099",
  },
  {
    id: 4,
    name: "iPhone 12",
    category: "Smartphones",
    price: "$699",
  },
  {
    id: 5,
    name: "Samsung Galaxy S22",
    category: "Smartphones",
    price: "$799",
  },
  {
    id: 6,
    name: "Samsung Galaxy S22 Ultra",
    category: "Smartphones",
    price: "$1199",
  },
  {
    id: 7,
    name: "iPad Pro 11",
    category: "Tablets",
    price: "$799",
  },
  {
    id: 8,
    name: "iPad Air - Version 2.11.13",
    category: "Tablets",
    price: "$599.44",
  },
  {
    id: 9,
    name: "Samsung Galaxy Tab S8",
    category: "Tablets",
    price: "$699",
  },
  {
    id: 10,
    name: 'MacBook Pro 14"',
    category: "Laptops",
    price: "$1999",
  },
  {
    id: 11,
    name: "MacBook Air",
    category: "Laptops",
    price: "$999",
  },
  {
    id: 12,
    name: "Dell XPS 13",
    category: "Laptops",
    price: "$1299",
  },
  {
    id: 13,
    name: "AirPods Pro",
    category: "Audio",
    price: "$249",
  },
  {
    id: 14,
    name: "AirPods Max",
    category: "Audio",
    price: "$549",
  },
  {
    id: 15,
    name: "Samsung Galaxy Buds Pro",
    category: "Audio",
    price: "$199",
  },
];

function DefaultExample() {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  return (
    <GridCombobox<Product>
      value={selectedProduct}
      onChange={setSelectedProduct}
      displayValue={(product) => product?.name ?? ""}
    >
      <GridComboboxLabel />

      <GridComboboxInput labelId="product-select" menuId="product-menu" />

      <GridComboboxMenu id="product-menu">
        {products.map((product, index) => (
          <GridComboboxMenuItem
            key={product.id}
            index={index}
            value={product}
            filterValue={product.name}
          >
            <span>{product.name}</span>
            <span>{product.category}</span>
            <span>{product.price}</span>
          </GridComboboxMenuItem>
        ))}
      </GridComboboxMenu>
    </GridCombobox>
  );
}

function CustomExample() {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const uid = useId();
  return (
    <GridCombobox<Product>
      renderContainer={({ children }) => {
        return children;
      }}
      value={selectedProduct}
      onChange={setSelectedProduct}
      displayValue={(product) => product?.name ?? ""}
    >
      <GridComboboxLabel
        renderLabel={(props) => {
          return props?.context.selectedValue ? (
            <>
              <label
                className="flex justify-between w-full"
                id={`label${uid}`}
                htmlFor={`input${uid}`}
              >
                <span className="text-red-600">{selectedProduct?.name}</span>
                <span className="text-red-600">{selectedProduct?.price}</span>
              </label>
            </>
          ) : (
            <label id={`label${uid}`} htmlFor={`input${uid}`}>
              Select Product From List
            </label>
          );
        }}
      />

      <GridComboboxInput
        renderInput={({
          context,
          handleFocus,
          handleInputChange,
          handleKeyDown,
          placeholder,
        }) => {
          return (
            <>
              <input
                ref={context?.inputRef}
                type="text"
                id={`input${uid}`}
                role="combobox"
                aria-expanded={context?.isOpen}
                aria-controls={"product-menu"}
                aria-labelledby={"product-select"}
                aria-activedescendant={
                  context?.activePosition.rowIndex >= 0
                    ? `option-${context?.activePosition.rowIndex}-${context?.activePosition.cellIndex}`
                    : undefined
                }
                value={context?.inputValue}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                onFocus={handleFocus}
                placeholder={placeholder}
                className={`w-full ${
                  selectedProduct ? "focus:ring-red-600" : "focus:ring-blue-500"
                } p-2 border border-gray-500 rounded focus:outline-none focus:ring-2 `}
              />
              {selectedProduct ? (
                <p className="text-red-600 text-sm mt-2">
                  Error: Please select another item.
                </p>
              ) : null}
            </>
          );
        }}
        labelId="product-select"
        menuId="product-menu"
      />

      <GridComboboxMenu
        id="product-menu"
        renderMenu={(props) => {
          return (
            <div
              style={{
                borderRadius: "5px",
                boxShadow: "2px 2px 12px 2px rgba(0,0,0,0.12)",
                marginTop: "8px",
              }}
            >
              {props?.children}
            </div>
          );
        }}
      >
        {/* // Custom Combobox Menu Item, AKA, The Grid Menu's Row and Cell entries. */}
        {products.map((product, index) => (
          <GridComboboxMenuItem
            key={product.id}
            index={index}
            value={product}
            filterValue={product.name}
            renderMenuItem={({
              RowContainer,
              isActiveRow,
              children,
              context,
              handleKeyDown,
              handleSelect,
            }) => {
              const { activePosition, setActivePosition } = context;

              return RowContainer({
                renderNode: (
                  <div
                    role="row"
                    className={`flex ${
                      context.selectedValue && isActiveRow
                        ? "bg-red-600"
                        : isActiveRow
                        ? "bg-gray-300"
                        : undefined
                    }`}
                  >
                    {React.Children.map(children, (child, cellIndex) => (
                      <div
                        role="gridcell"
                        id={`option-${index}-${cellIndex}`}
                        tabIndex={-1}
                        className={`flex-1 cursor-pointer p-2 ${
                          activePosition.rowIndex === index &&
                          activePosition.cellIndex === cellIndex
                            ? "outline outline-2 outline-blue-500"
                            : ""
                        }`}
                        onClick={handleSelect}
                        onFocus={() =>
                          setActivePosition({ rowIndex: index, cellIndex })
                        }
                        onKeyDown={(e) => handleKeyDown(e)}
                      >
                        {child}
                      </div>
                    ))}
                  </div>
                ),
              });
            }}
          >
            <span>{product.name}</span>
            <span>{product.category}</span>
            <span>{product.price}</span>
          </GridComboboxMenuItem>
        ))}
      </GridComboboxMenu>
    </GridCombobox>
  );
}
