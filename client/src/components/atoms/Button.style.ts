import styled from 'styled-components';

interface NavBarButtonProps {
    disabled: boolean,
}

export const NavBarButton = styled.button`
    margin-left: 5px;
    margin-right: 5px;
    padding: 0px;
    border: none;
    background-color: transparent;
    cursor: ${(props: NavBarButtonProps) => props.disabled ? 'default' : 'pointer'};
    width: 24px;
    height: 24px;
    border-radius: 12px;
    outline: none;
    color: ${(props: NavBarButtonProps) => props.disabled ? '#999' : '#333'};

    ${(props: NavBarButtonProps) => props.disabled ? null : `
        &:hover {
            background-color: #ddd;
        }
       &:active {
           background-color: #d0d0d0;
       }
    `};
`;

export const UrlFormButton = styled.button`
    position: absolute;
    top: 0px;
    right: 0px;
    padding: 0px;
    border: none;
    background-color: transparent;
    cursor: pointer;
    width: 24px;
    height: 24px;
    border-radius: 12px;
    outline: none;
    color: #333;
    
    &:hover {
      background-color: #ddd;
    },
    
    &:active {
      background-color: #d0d0d0;
    },
`;
