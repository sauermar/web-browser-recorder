import type {
    FC,
} from 'react';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { definition as faArrowLeft } from '@fortawesome/free-solid-svg-icons/faArrowLeft';
import { definition as faArrowRight } from '@fortawesome/free-solid-svg-icons/faArrowRight';
import { definition as faRedo } from '@fortawesome/free-solid-svg-icons/faRedo';

import { NavBarButton } from '../atoms/Button.style';
import UrlForm from './UrlForm';

const StyledNavBar = styled.div`
    display: flex;
    padding: 5px;
    background-color: #f6f6f6;
`;

type NavBarProps = {
    canMoveForward: boolean;
    canMoveBack: boolean;
    currentAddress: string;
    refresh: () => void;
    goBack: () => void;
    goForward: () => void;
    goTo: (nextAddress: string) => void;
};

const NavBar: FC<NavBarProps> = ({
   canMoveForward,
   canMoveBack,
   currentAddress,
   refresh,
   goBack,
   goForward,
   goTo,
}) => (
    <StyledNavBar>
        <NavBarButton
            type="button"
            onClick={goBack}
            disabled={!canMoveBack}
        >
            <FontAwesomeIcon
                icon={faArrowLeft}
            />
        </NavBarButton>

        <NavBarButton
            type="button"
            onClick={goForward}
            disabled={!canMoveForward}
        >
            <FontAwesomeIcon
                icon={faArrowRight}
            />
        </NavBarButton>

        <NavBarButton
            type="button"
            onClick={refresh}
            disabled={false}
        >
            <FontAwesomeIcon
                icon={faRedo}
            />
        </NavBarButton>

        <UrlForm
            initialAddress={currentAddress}
        />
    </StyledNavBar>
);

export default NavBar;
