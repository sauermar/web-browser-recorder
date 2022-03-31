import React, { FC } from "react";
import styled from "styled-components";
import { CSSTransition } from "react-transition-group";

export type PanelType = 'right' | 'left';

interface SlidingPanelProps {
  type: PanelType;
  size: number;
  isOpen: boolean;
  children?: React.ReactElement | null;
}

export const SlidingPanel: FC<SlidingPanelProps> = ({
  type= 'left',
  size= 50,
  isOpen,
  children= null,
}) => {
  return (
      <SlidingPanelContainer isOpen={ isOpen } >
        <CSSTransition
          in={ isOpen }
          timeout={ 500 }
          unmountOnExit
        >
          <TransitionContainer type={type}>
            {(type === 'right') && (
              <PanelGlassStyle type={type} size={size}/>
            )}
            <PanelStyle type={ type } size={ size }>
              <PanelContent>{ children }</PanelContent>
            </PanelStyle>
            {(type === 'left') && (
              <PanelGlassStyle type={type} size={size}/>
            )}
          </TransitionContainer>
        </CSSTransition>
      </SlidingPanelContainer>
  );
};

const TransitionContainer = styled.div<{ type: PanelType }>`
  display: flex;
  
  &.${({ type }) => type}-enter {
    opacity: 0;
    transform: ${({ type }) => type === 'left' ? `translateX(-100%)` : `translateX(100%)` };
  }
  &.${({ type }) => type}-enter-active {
    opacity: 1;
    transform: translateX(0);
    transition: transform 500ms, opacity 500ms;
  }
  &.${({ type }) => type}-exit {
    opacity: 1;
    transform: translateX(0);
  }
  &.${({ type }) => type}-exit-active {
    opacity: 0;
    transform: ${({ type }) => type === 'left' ? `translateX(-100%)` : `translateX(100%)` };
    transition: transform 500ms, opacity 500ms;
  }

`;

const SlidingPanelContainer = styled.div<{ isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;

  ${({ isOpen }) => isOpen ?`
       &:active {
         position: fixed;
         z-index: 15000;
         background-color: gray;
         will-change: transform;
       }
    `: null 
  };
`;

const PanelContent = styled.div`
  height: 100%;
  width: 100%;
  pointer-events: all;
  background-color: red;
`;

const PanelStyle = styled.div<{ type: PanelType, size: number }>`
  width: ${({ size }) => size}vw;
  height: 100vh;
  ${({ type }) =>  type === 'right' ? `right: 0` : null };
  position: inherit;
  overflow: auto;
`;

const PanelGlassStyle = styled.div<{ type: PanelType, size: number }>`
  width: ${({ size }) => (100 - size)}vw;
  height: 100vh;
  ${({ type }) =>  type === 'right' ? `left: 0` : null };
  position: inherit;
`;
