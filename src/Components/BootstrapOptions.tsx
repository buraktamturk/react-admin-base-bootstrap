import React, {createContext, ReactNode, useContext, useMemo} from "react";
import BootstrapOptions from "./BootstrapOptions";

interface BootstrapOptions {
    noCloseModal: boolean;
    noCloseOnSave: boolean;
    onlySaveOnDirty: boolean;
}

interface BootstrapOptionsProviderProps extends BootstrapOptions {
    children: ReactNode;
}

const BootstrapOptionsContext = createContext<BootstrapOptions>({
    noCloseModal: false,
    noCloseOnSave: false,
    onlySaveOnDirty: false
});

export function useBootstrapOptions() {
    return useContext(BootstrapOptionsContext);
}

export default function BootstrapOptionsProvider({children,noCloseModal,noCloseOnSave, onlySaveOnDirty}: BootstrapOptionsProviderProps) {
    const options = useMemo(() => ({noCloseModal,noCloseOnSave,onlySaveOnDirty}), [noCloseModal, noCloseOnSave]);
    return <BootstrapOptionsContext.Provider value={options}>
        { children }
    </BootstrapOptionsContext.Provider>;
}
