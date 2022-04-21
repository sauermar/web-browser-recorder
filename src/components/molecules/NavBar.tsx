import React from 'react';
import styled from "styled-components";


export const NavBar = () => {
  return (
    <NavBarWrapper>
      <ProjectName>Recorder</ProjectName>
      <NavBarLine/>
    </NavBarWrapper>
  );
};

const NavBarLine = styled.hr`
  height: 2px;
  border-width: 0;
  color: silver;
  background-color: silver;
`;

const NavBarWrapper = styled.div`
  grid-area: navbar;
`;

const ProjectName = styled.b`
  padding: 15px;
  display: inline-block;
`;
