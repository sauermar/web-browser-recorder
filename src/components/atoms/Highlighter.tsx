import React  from 'react';

import styled from "styled-components";
import { mapRect } from "../../functions/inputHelpers";
import canvas from "./canvas";

interface HighlighterProps {
  unmodifiedRect: DOMRect;
  displayedSelector: string;
  width: number;
  height: number;
  canvasRect: DOMRect;
};

export const Highlighter = ({ unmodifiedRect, displayedSelector = '', width, height, canvasRect}: HighlighterProps) => {
  if (!unmodifiedRect) {
    return null;
  } else {
    const unshiftedRect = mapRect(unmodifiedRect, width, height);
    const rect = {
      bottom: unshiftedRect.bottom + canvasRect.top,
      top: unshiftedRect.top + canvasRect.top,
      left: unshiftedRect.left + canvasRect.left,
      right: unshiftedRect.right + canvasRect.left,
      x: unshiftedRect.x + canvasRect.left,
      y: unshiftedRect.y + canvasRect.top,
      width: unshiftedRect.width,
      height: unshiftedRect.height,
    }

    // make the highlighting rectangle stay in browser window boundaries
    if (rect.bottom > canvasRect.bottom) {
      rect.height = height - unshiftedRect.top;
    }

    if (rect.top < canvasRect.top) {
      rect.height = rect.height - (canvasRect.top - rect.top);
      rect.top = canvasRect.top;
    }

    if (rect.right > canvasRect.right) {
      rect.width = width - unshiftedRect.left;
    }

    if (rect.left < canvasRect.left) {
      rect.width = rect.width - (canvasRect.left - rect.left);
      rect.left = canvasRect.left;
    }


    return (
      <div>
        <HighlighterOutline
          id="Highlighter-outline"
          top={rect.top}
          left={rect.left}
          width={rect.width}
          height={rect.height}
        />
        <HighlighterLabel
          id="Highlighter-label"
          top={rect.top + rect.height + 8}
          left={rect.left}
        >
          {displayedSelector}
        </HighlighterLabel>
      </div>
    );
  }
}

const HighlighterOutline = styled.div<HighlighterOutlineProps>`
  box-sizing: border-box;
  pointer-events: none !important;
  position: fixed !important;
  background: #ff5d5b26 !important;
  border: 2px solid #ff5d5b !important;
  z-index: 2147483647 !important;
  border-radius: 5px;
  top: ${(p: HighlighterOutlineProps) => p.top}px;
  left: ${(p: HighlighterOutlineProps) => p.left}px;
  width: ${(p: HighlighterOutlineProps) => p.width}px;
  height: ${(p: HighlighterOutlineProps) => p.height}px;
`;

const HighlighterLabel = styled.div<HighlighterLabelProps>`
  pointer-events: none !important;
  position: fixed !important;
  background: #080a0b !important;
  color: white !important;
  padding: 8px !important;
  font-family: monospace !important;
  border-radius: 5px !important;
  z-index: 2147483647 !important;
  top: ${(p: HighlighterLabelProps) => p.top}px;
  left: ${(p: HighlighterLabelProps) => p.left}px;
`;

interface HighlighterLabelProps{
  top: number;
  left: number;
}

interface HighlighterOutlineProps {
  top: number;
  left: number;
  width: number;
  height: number;
}
