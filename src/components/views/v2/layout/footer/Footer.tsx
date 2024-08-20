import './Footer.css';
import { Link } from '@mui/material';
import { Constant } from 'model/enum/constant';

// @ts-ignore
// noinspection JSUnusedLocalSymbols
export const Footer = (props: any) => {
	return <footer
		className="flex justify-around p-4"
	>
		<Link href={Constant.balancesPath.value}>
			{Constant.balancesPath.title}
		</Link>
		<Link href={Constant.marketsPath.value}>
			{Constant.marketsPath.title}
		</Link>
		<Link href={Constant.ordersPath.value}>
			{Constant.ordersPath.title}
		</Link>
		<Link href={Constant.createOrderPath.value}>
			{Constant.createOrderPath.title}
		</Link>
	</footer>;
}
