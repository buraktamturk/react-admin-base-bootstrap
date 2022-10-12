import React, { useCallback, useContext, useMemo } from "react";
import { FormattedMessage } from "react-intl";

const IndexContext = React.createContext(0);
const OnClickDataContext = React.createContext<[number, (a: Number) => void]>(null as any);

type StepListProps = {
    active: number;
    setActive: (active: number) => {};
    children: React.ReactNode;
}

export default function StepList({ active, setActive, children }: StepListProps) {
	const onClickData = useMemo<[number, (a: Number) => void]>(() => [active, setActive], [active, setActive]);
	
	return <ul className="step step-sm step-icon-sm step step-inline step-item-between mb-3">
		{ 
			React.Children.map(children, (element, index) => <IndexContext.Provider value={index}>
				<OnClickDataContext.Provider value={onClickData}>
					{ element }
				</OnClickDataContext.Provider>
			</IndexContext.Provider>)
		}
	</ul>;
}

type StepItemProps = {
    title?: string;
    translate?: string;
    disabled?: boolean;
}

export function StepItem({ title, translate, disabled }: StepItemProps) {
	const index = useContext(IndexContext);
	const [ activeStep, onClickParent ] = useContext(OnClickDataContext);
	
	const onClick = useCallback(function() {
		onClickParent(index);
	}, [ index, onClickParent ]);
	
	return <li className={"step-item focus" + (index === activeStep ? ' active' : '')}>
		<a className="step-content-wrapper" onClick={onClick}>
			<span className="step-icon step-icon-soft-dark">{index + 1}</span>
			<div className="step-content">
				<span className={"step-title" + (disabled ? " text-muted" : "")}>
					{ title || <FormattedMessage id={translate} /> }
				</span>
			</div>
		</a>
	</li>;
}
