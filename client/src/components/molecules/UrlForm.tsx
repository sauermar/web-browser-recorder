import {useState, useCallback, useEffect, useContext,} from 'react';
import type { FC, SyntheticEvent, } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { definition as faAngleRight } from '@fortawesome/free-solid-svg-icons/faAngleRight';

import { NavBarForm, NavBarInput } from "../atoms/Form.style";
import { UrlFormButton } from "../atoms/Button.style";
import { SocketContext } from '../../context/socket';

type Props = {
    currentAddress: string;
    refresh: () => void;
    goTo: (nextAddress: string) => void;
};

const UrlForm: FC<Props> = ({
    currentAddress,
    refresh,
    goTo,
}) => {
    const [address, setAddress] = useState<string>(currentAddress);

    const socket = useContext(SocketContext);

    const isSameAddresses = address === currentAddress;

    const onChange = useCallback((event: SyntheticEvent): void => {
        const newUrl = (event.target as HTMLInputElement).value;
        setAddress(newUrl);
        socket.emit('input:url', newUrl);
    }, []);

    const onSubmit = (event: SyntheticEvent): void => {
        event.preventDefault();

        if (isSameAddresses) {
            refresh();
        } else {
            goTo(address);
        }
    };

    useEffect(() => {
        if (!isSameAddresses) {
            setAddress(currentAddress);
        }
    }, [currentAddress]);

    return (
        <NavBarForm
            onSubmit={onSubmit}
        >
            <NavBarInput
                type="text"
                value={address}
                onChange={onChange}
            />

            {
                address !== currentAddress && (
                    <UrlFormButton
                        type="submit"
                    >
                        <FontAwesomeIcon
                            icon={faAngleRight}
                        />
                    </UrlFormButton>
                )
            }
        </NavBarForm>
    );
};

export default UrlForm;
