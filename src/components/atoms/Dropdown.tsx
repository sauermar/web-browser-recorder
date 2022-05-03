import * as React from "react";
import { Wrapper, ActivatorButton, DropdownList } from "./Dropdown.styles";

export interface IDropdownItem {
  id: number;
  text: string;
}

interface IProps {
  activatorText?: string;
  items: IDropdownItem[];
  onItemClick: (item: IDropdownItem) => void;
}

export const Dropdown = ({ activatorText = "Dropdown", items, onItemClick }: IProps) => {
  const activatorRef = React.useRef<HTMLButtonElement | null>(null);
  const listRef = React.useRef<HTMLUListElement | null>(null);
  const [isOpen, setIsOpen] = React.useState(false);
  const [activeIndex, setActiveIndex] = React.useState(-1);
  const [text, setText] = React.useState(activatorText);

  const handleClick = () => {
    setIsOpen(!isOpen);
  };

  const handleClickOnItem = (item: IDropdownItem) => {
    setText(item.text);
    setIsOpen(false);
    onItemClick(item);
  };

  const keyHandler = (event: React.KeyboardEvent) => {
      if (isOpen) {
        switch (event.key) {
          case "Escape":
            setIsOpen(false);
            break;
        }
      }
    }
    ;

    const handleClickOutside = (event: any) => {
      if (
        listRef.current!.contains(event.target) ||
        activatorRef.current!.contains(event.target)
      ) {
        return;
      }
      setIsOpen(false);
    };

    React.useEffect(() => {
      if (isOpen) {
        listRef.current!.querySelector("a")!.focus();
        document.addEventListener("mouseup", handleClickOutside);
      } else {
        document.removeEventListener("mouseup", handleClickOutside);
      }
      return () => {
        document.removeEventListener("mouseup", handleClickOutside);
      };
    }, [isOpen]);

    React.useEffect(() => {
      if (!isOpen) {
        setActiveIndex(-1);
      }
    }, [isOpen]);

    const focusHandler = (index: number) => {
      setActiveIndex(index);
    };

    return (
      <Wrapper onKeyUp={keyHandler}>
        <ActivatorButton
          aria-haspopup="true"
          aria-controls="dropdown"
          onClick={handleClick}
          ref={activatorRef}
          onFocus={() => setActiveIndex(-1)}
        >
          {text}
        </ActivatorButton>
        <DropdownList id="dropdown" ref={listRef} active={isOpen} role="list">
          {items.map((item, index) => (
            <li key={item.id}>
              <a onFocus={() => focusHandler(index)} onClick={ () => handleClickOnItem(item)}>
                {item.text}
              </a>
            </li>
          ))}
        </DropdownList>
      </Wrapper>
    );
};
