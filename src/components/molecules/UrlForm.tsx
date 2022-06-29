import {useState, useCallback, useEffect,} from 'react';
import type { SyntheticEvent, } from 'react';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';

import { NavBarForm, NavBarInput } from "../atoms/form";
import { UrlFormButton } from "../atoms/buttons/buttons";
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
    }, [address]);

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

    useEffect(() => {
        setAddress(currentAddress)
        console.log(`changing address in url form for ${currentAddress}`)
    }, [currentAddress]);

    return (
        <NavBarForm onSubmit={onSubmit}>
            <NavBarInput
                type="text"
                value={address}
                onChange={onChange}
            />
            <UrlFormButton type="submit">
                <KeyboardArrowRightIcon/>
            </UrlFormButton>
        </NavBarForm>
    );
};
