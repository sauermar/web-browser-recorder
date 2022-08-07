import styled from "styled-components";
import { Stack } from "@mui/material";

export const Loader = () => {
  return (
    <Stack direction="column" sx={{margin: "30px 0px 291px 0px"}}>
      <StyledLoader/>
      <StyledParagraph >Loading...</StyledParagraph>
    </Stack>
  );
}

const StyledParagraph = styled.p`
  font-size: x-large;
  font-family: inherit;
  color: #1976d2;
  display: grid;
  justify-content: center;
`;

const StyledLoader = styled.div`
  border-radius: 50%;
  color: #1976d2;
  font-size: 11px;
  text-indent: -99999em;
  margin: 55px auto;
  position: relative;
  width: 10em;
  height: 10em;
  box-shadow: inset 0 0 0 1em;
  -webkit-transform: translateZ(0);
  -ms-transform: translateZ(0);
  transform: translateZ(0);
  &:before {
    position: absolute;
    content: '';
    border-radius: 50%;
    width: 5.2em;
    height: 10.2em;
    background: #ffffff;
    border-radius: 10.2em 0 0 10.2em;
    top: -0.1em;
    left: -0.1em;
    -webkit-transform-origin: 5.1em 5.1em;
    transform-origin: 5.1em 5.1em;
    -webkit-animation: load2 2s infinite ease 1.5s;
    animation: load2 2s infinite ease 1.5s;
  }
  &:after {
    position: absolute;
    content: '';
    border-radius: 50%;
    width: 5.2em;
    height: 10.2em;
    background: #ffffff;
    border-radius: 0 10.2em 10.2em 0;
    top: -0.1em;
    left: 4.9em;
    -webkit-transform-origin: 0.1em 5.1em;
    transform-origin: 0.1em 5.1em;
    -webkit-animation: load2 2s infinite ease;
    animation: load2 2s infinite ease;
  }
  @-webkit-keyframes load2 {
    0% {
      -webkit-transform: rotate(0deg);
      transform: rotate(0deg);
    }
    100% {
      -webkit-transform: rotate(360deg);
      transform: rotate(360deg);
    }
  }
  @keyframes load2 {
    0% {
      -webkit-transform: rotate(0deg);
      transform: rotate(0deg);
    }
    100% {
      -webkit-transform: rotate(360deg);
      transform: rotate(360deg);
    }
  }
`;
