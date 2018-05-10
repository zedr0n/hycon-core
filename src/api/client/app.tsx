import * as React from "react"
import { match, RouteComponentProps, RouteProps } from "react-router"
import { RouteConfig } from "react-router-config"
import { Link, Route, Switch } from "react-router-dom"
import { IRest } from "./rest"

export const routes: RouteConfig[] = [
    { exact: true, path: "/" },
    { exact: true, path: "/tx/:hash" },
    { exact: true, path: "/block/:hash" },
    { exact: true, path: "/txList" },
    { exact: true, path: "/address/:hash" },
    { exact: true, path: "/wallet" },
    { exact: true, path: "/transaction/:name" },
    { exact: true, path: "/peersView" },
    { exact: true, path: "/peer/:hash" },
    { exact: true, path: "/wallet/addWallet" },
    { exact: true, path: "/wallet/recoverWallet" },
    { exact: true, path: "/wallet/:name" },
]

export class App extends React.Component<any, any> {
    public rest: IRest
    public blockView: ({ match }: RouteComponentProps<{ hash: string }>) => JSX.Element
    public home: ({ match }: RouteComponentProps<{}>) => JSX.Element
    public addressInfo: (
        { match }: RouteComponentProps<{ hash: string }>,
    ) => JSX.Element
    public txView: ({ match }: RouteComponentProps<{ hash: string }>) => JSX.Element

    public transaction: ({ match }: RouteComponentProps<{ name: string }>) => JSX.Element
    public peersView: ({ match }: RouteComponentProps<{ hash: string }>) => JSX.Element
    public peerDetails: (
        { match }: RouteComponentProps<{ hash: string }>,
    ) => JSX.Element

    public wallet: ({ match }: RouteComponentProps<{}>) => JSX.Element
    public addWallet: ({ match }: RouteComponentProps<{}>) => JSX.Element
    public recoverWallet: ({ match }: RouteComponentProps<{}>) => JSX.Element
    public walletDetail: (
        { match }: RouteComponentProps<{ name: string }>,
    ) => JSX.Element
}
