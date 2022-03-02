import {useState, useCallback, useEffect, useContext,} from 'react';
import type { FC, SyntheticEvent, } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { definition as faAngleRight } from '@fortawesome/free-solid-svg-icons/faAngleRight';

import { NavBarForm, NavBarInput } from "../atoms/Form.style";
import { UrlFormButton } from "../atoms/Button.style";
import { SocketContext } from '../../context/socket';
import {Socket} from "socket.io-client";

type Props = {
    initialAddress: string;
};

const refresh = (socket: Socket) : void => {
    socket.emit('input:refresh');
};

const goTo = (socket : Socket, address: string) : void => {
    socket.emit('input:url', address);
};

const UrlForm: FC<Props> = ({
    initialAddress,
}) => {
    // states:
    const [address, setAddress] = useState<string>(initialAddress);
    const [currentAddress, setCurrentAddress] = useState<string>(initialAddress);
    // context:
    const socket = useContext(SocketContext);

    const areSameAddresses = address === currentAddress;

    const onChange = useCallback((event: SyntheticEvent): void => {
        setAddress((event.target as HTMLInputElement).value);
    }, []);

    const onSubmit = (event: SyntheticEvent): void => {
        event.preventDefault();

        if (areSameAddresses) {
            refresh(socket);
        } else {
            try {
                // try the validity of url
                new URL(address);
                goTo(socket, address);
                setCurrentAddress(address);
            } catch (e) {
                // TODO: make an alert from this
                alert('ERROR: not a valid url!');
            }
        }
    };

    return (
        <NavBarForm onSubmit={onSubmit}>
            <NavBarInput
                type="text"
                value={address}
                onChange={onChange}
            />
            <UrlFormButton type="submit">
                <FontAwesomeIcon
                    icon={faAngleRight}
                />
            </UrlFormButton>
        </NavBarForm>
    );
};

export default UrlForm;
