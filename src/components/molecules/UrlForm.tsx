import {useState, useCallback, useContext, useEffect,} from 'react';
import type { FC, SyntheticEvent, } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { definition as faAngleRight } from '@fortawesome/free-solid-svg-icons/faAngleRight';

import { NavBarForm, NavBarInput } from "../atoms/form";
import { UrlFormButton } from "../atoms/buttons";
import { useSocketStore } from '../../context/socket';
import {Socket} from "socket.io-client";

type Props = {
    currentAddress: string;
    handleRefresh: (socket: Socket) => void;
    setCurrentAddress: (address: string) => void;
};

export const UrlForm = ({
    currentAddress,
    handleRefresh,
    setCurrentAddress,
}: Props) => {
    // states:
    const [address, setAddress] = useState<string>(currentAddress);
    // context:
    const { socket } = useSocketStore();

    const areSameAddresses = address === currentAddress;

    const onChange = useCallback((event: SyntheticEvent): void => {
        setAddress((event.target as HTMLInputElement).value);
    }, []);

    const onSubmit = (event: SyntheticEvent): void => {
        event.preventDefault();
        let url = address;

        // add protocol if missing
        if (!/^(?:f|ht)tps?\:\/\//.test(address)) {
            url = "https://" + address;
            setAddress(url);
        }

        if (areSameAddresses) {
            if (socket) {
                handleRefresh(socket);
            }
        } else {
            try {
                // try the validity of url
                new URL(url);
                setCurrentAddress(url);
            } catch (e) {
                alert(`ERROR: ${url} is not a valid url!`);
            }
        }
    };

    useEffect(() => setAddress(currentAddress), [currentAddress]);

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
