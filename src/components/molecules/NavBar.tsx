import React from 'react';
import styled from "styled-components";


export const NavBar = () => {
  return (
    <NavBarWrapper>
      <ProjectName>Web Browser Recorder</ProjectName>
    </NavBarWrapper>
  );
};

const NavBarWrapper = styled.div`
  grid-area: navbar;
  background-color: dimgray;
`;

const ProjectName = styled.b`
  padding: 20px;
  display: inline-block;
  color: white;
  font-size: 1.5em;
`;
