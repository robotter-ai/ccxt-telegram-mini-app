import React from "react";

export enum ButtonType {
	Full = "full",
	Bordered = "bordered",
}

function Button(props: {
	value: string,
	type: ButtonType,
	icon?: string,
	disabled?: boolean,
	onClick?: (e?: React.MouseEvent<HTMLButtonElement>) => void | Promise<void>,
}) {
	return (
		<div className="mx-2 w-full flex justify-center items-center">
			<button
				className={`my-2 px-8 py-3 rounded-3xl w-full text-center flex items-center justify-center ${props.type === ButtonType.Full ? "max-w-xs w-full bg-white text-black font-bold" : "border"}`}
				onClick={props.onClick}
				disabled={props.disabled}
			>
				{props.icon ? <p className="mr-1.5">{props.icon}</p> : null}
				{props.value}
			</button>
		</div>
	);
}

export default Button;
