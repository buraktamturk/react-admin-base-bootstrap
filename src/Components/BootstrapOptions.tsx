import React, {createContext, ReactNode, useContext, useMemo} from "react";
import BootstrapOptions from "./BootstrapOptions";

interface BootstrapOptions {
    noCloseModal: boolean;
}

interface BootstrapOptionsProviderProps extends BootstrapOptions {
    children: ReactNode;
}

const BootstrapOptionsContext = createContext<BootstrapOptions>({
    noCloseModal: false
});

export function useBootstrapOptions() {
    return useContext(BootstrapOptionsContext);
}

export default function BootstrapOptionsProvider({children,noCloseModal}: BootstrapOptionsProviderProps) {
    const options = useMemo(() => ({noCloseModal}), [noCloseModal]);
    return <BootstrapOptionsContext.Provider value={options}>
        { children }
    </BootstrapOptionsContext.Provider>;
}
