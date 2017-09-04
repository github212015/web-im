import React from "react"
import { connect } from "react-redux"
import Immutable from "seamless-immutable"
import { Card, Icon, Menu, Popconfirm, Table, Tooltip, Dropdown } from "antd"
import _ from "lodash"
import { I18n } from "react-redux-i18n"
import GroupActions from "@/redux/GroupRedux"
import GroupMemberActions from "@/redux/GroupMemberRedux"
import "./style/index.less"



const iconStyle = { fontSize: 16, marginLeft: 15 }

class MemberSettingMenu extends React.Component {

    constructor(props) {
        super(props)
        this.handleSetAdmin = this.props.handleSetAdmin
    }
    
    onClick = ({ key }) => {
        if (typeof this[key] === "function") {
            this[key]()
        }
    }

    render() {

        const { handleSetAdmin, isAdmin } = this.props

        const menu = (
            <Menu onClick={ this.onClick }>
                <Menu.Item key="handleSetAdmin">{I18n.t(isAdmin ? "removeAdmin" : "setAdmin")}</Menu.Item>
                <Menu.Item key="2">{I18n.t("groupBlockSingle")}</Menu.Item>
                <Menu.Item key="3">{I18n.t("removeSingleGroupMember")}</Menu.Item>
            </Menu>
        )

        return (
            <Dropdown overlay={menu} trigger={[ "click" ]}>
                <a className="ant-dropdown-link" href="#menu">
                    <Icon type="down" style={ iconStyle } />
                </a>
            </Dropdown>
        )
    }
}




class GroupMembers extends React.Component {
    setAdmin = (groupId, name) => this.props.setAdminAsync(groupId, name)

    removeAdmin = (groupId, name) => this.props.removeAdminAsync(groupId, name)

    mute = (groupId, name) => this.props.muteAsync(groupId, name)

    removeMute = (groupId, name) => this.props.removeMuteAsync(groupId, name)

    groupBlockSingle = (groupId, name) => this.props.groupBlockSingleAsync(groupId, name)

    removeSingleGroupMember = (groupId, name) => this.props.removeSingleGroupMemberAsync(groupId, name)

    render() {
        const { entities, login, roomId, groupMember } = this.props
        // const memberActionMenu = (
        //     <Menu>
        //         <Menu.Item key="1">
        //             <Tooltip>
        //                 <Popconfirm title="确认设为管理员吗？" onConfirm={() => this.setAdmin(record.name)}>
        //                     <a href="#">设为管理</a>
        //                 </Popconfirm>
        //             </Tooltip>
        //         </Menu.Item>
        //     </Menu>
        // )
        let owner
        let isOwner = false
        const currentUser = _.get(login, "username", "")
        const members = _.get(groupMember, `${roomId}.byName`, [])
        const admins = _.get(groupMember, `${roomId}.admins`, [])
        const muted = _.get(groupMember, `${roomId}.muted`, [])

        const data = _.map(members, (val, key) => {
            const { affiliation } = val
            console.log(affiliation)
            if (affiliation === "owner") {
                owner = key
                if (key === currentUser) {
                    isOwner = true
                }
            }
            const isAdmin = _.includes(admins, key)
            const isMuted = _.includes(muted, key)
            return { name: key, key, affiliation, isAdmin, isMuted }
        })
        const columns = [
            {
                title: "Name",
                key: "name",
                dataIndex: "name"
            },
            {
                title: "Action",
                key: "action",
                render: (text, record) => {
                    // const isAdmin = _.includes(admins, currentUser)
                    const canOperate =
                        record.name !== currentUser && // self
                        record.name !== owner && // owner
                        (isOwner || _.includes(admins, currentUser))
                    // return data.length > 0 && (isAdmin || (isOwner && owner !== record.name))
                    const AdminIcons = (props) => {
                        const { admins, record } = props
                        return _.includes(admins, record.name)
                            ? <Popconfirm
                                title={I18n.t("confirm") + " " + I18n.t("removeAdmin")}
                                onConfirm={() => this.removeAdmin(roomId, record.name)}
                            >
                                <Tooltip title={I18n.t("removeAdmin")} placement="left">
                                    <Icon type="arrow-down" style={iconStyle} />
                                </Tooltip>
                            </Popconfirm>
                            : <Popconfirm
                                title={I18n.t("confirm") + " " + I18n.t("setAdmin")}
                                onConfirm={() => this.setAdmin(roomId, record.name)}
                            >
                                <Tooltip title={I18n.t("setAdmin")} placement="left">
                                    <Icon type="arrow-up" style={iconStyle} />
                                </Tooltip>
                            </Popconfirm>
                    }
                    const MuteIcons = (props) => {
                        const { muted, record } = props
                        return _.hasIn(muted, [ "byName", record.name ])
                            ? <Popconfirm
                                title={I18n.t("confirm") + " " + I18n.t("removeMute")}
                                onConfirm={() => this.removeMute(roomId, record.name)}
                            >
                                <Tooltip title={I18n.t("removeMute")} placement="left">
                                    <Icon type="unlock" style={iconStyle} />
                                </Tooltip>
                            </Popconfirm>
                            : <Popconfirm
                                title={I18n.t("confirm") + " " + I18n.t("mute")}
                                onConfirm={() => this.mute(roomId, record.name)}
                            >
                                <Tooltip title={I18n.t("mute")} placement="left">
                                    <Icon type="lock" style={iconStyle} />
                                </Tooltip>
                            </Popconfirm>
                    }
                    return data.length > 0 && canOperate
                        ? <span className="fr">{record.isAdmin}

                            <MemberSettingMenu 
                                roomid={roomId}
                                isAdmin={_.includes(admins, record.name)}
                                isMuted={true}
                                handleSetAdmin={()=>{
                                    if (_.includes(admins, record.name)) {
                                        this.removeAdmin(roomId, record.name)
                                    }  else {
                                        this.setAdmin(roomId, record.name)
                                    }
                                }}

                                handleSetMute={() => {
                                    if (_.hasIn(muted, [ "byName", record.name ])) {
                                        this.removeMute(roomId, record.name)
                                    } else {
                                        this.mute(roomId, record.name)
                                    }
                                }}
                            />

                            {/* <Dropdown overlay={memberActionMenu} trigger={['click']}><Icon type="info-circle-o" /></Dropdown> */}
                            {/* <Popconfirm
                                title={I18n.t("confirm") + " " + I18n.t("setAdmin")}
                                onConfirm={() => this.setAdmin(roomId, record.name)}
                            >
                                <Tooltip title={I18n.t("setAdmin")} placement="left">
                                    <Icon type="arrow-up" />
                                </Tooltip>
                            </Popconfirm>
                            <Popconfirm
                                title={I18n.t("confirm") + " " + I18n.t("removeAdmin")}
                                onConfirm={() => this.removeAdmin(roomId, record.name)}
                            >
                                <Tooltip title={I18n.t("removeAdmin")} placement="left">
                                    <Icon type="arrow-down" />
                                </Tooltip>
                            </Popconfirm> */}
                            <AdminIcons record={record} admins={admins} />
                            {/* <Popconfirm
                                title={I18n.t("confirm") + " " + I18n.t("mute")}
                                onConfirm={() => this.mute(roomId, record.name)}
                            >
                                <Tooltip title={I18n.t("mute")} placement="left">
                                    <Icon type="lock" />
                                </Tooltip>
                            </Popconfirm>
                            <Popconfirm
                                title={I18n.t("confirm") + " " + I18n.t("removeMute")}
                                onConfirm={() => this.removeMute(roomId, record.name)}
                            >
                                <Tooltip title={I18n.t("removeMute")} placement="left">
                                    <Icon type="unlock" />
                                </Tooltip>
                            </Popconfirm> */}
                            <MuteIcons record={record} muted={muted} />
                            <Popconfirm
                                title={I18n.t("confirm") + " " + I18n.t("groupBlockSingle")}
                                onConfirm={() => this.groupBlockSingle(roomId, record.name)}
                            >
                                <Tooltip title={I18n.t("groupBlockSingle")} placement="left">
                                    <Icon type="frown-o" style={iconStyle} />
                                </Tooltip>
                            </Popconfirm>
                            <Popconfirm
                                title={I18n.t("confirm") + " " + I18n.t("removeSingleGroupMember")}
                                onConfirm={() => this.removeSingleGroupMember(roomId, record.name)}
                            >
                                <Tooltip title={I18n.t("removeSingleGroupMember")} placement="left">
                                    <Icon type="usergroup-delete" style={iconStyle} />
                                </Tooltip>
                            </Popconfirm>
                        </span>
                        : null
                }
            }
        ]
        return (
            <Card title={I18n.t("members")} bordered={false} noHovering={true} className="group-member-wrapper">
                {/* <Menu className="group-member-list">
                    {members.map((val, idx) => <Menu.Item key={idx} className="group-member-item"><span>{val}</span></Menu.Item>)}
                </Menu> */}
                <Table
                    columns={columns}
                    dataSource={data}
                    showHeader={false}
                    pagination={false}
                    scroll={{ y: 300 }}
                    className="group-member-list"
                />
            </Card>
        )
    }
}

export default connect(
    ({ entities, login }) => ({ entities, login, groupMember: entities.groupMember }),
    dispatch => ({
        setAdminAsync: (groupId, name) => dispatch(GroupMemberActions.setAdminAsync(groupId, name)),
        removeAdminAsync: (groupId, name) => dispatch(GroupMemberActions.removeAdminAsync(groupId, name)),
        muteAsync: (groupId, name) => dispatch(GroupMemberActions.muteAsync(groupId, name)),
        removeMuteAsync: (groupId, name) => dispatch(GroupMemberActions.removeMuteAsync(groupId, name)),
        groupBlockSingleAsync: (groupId, name) => dispatch(GroupActions.groupBlockSingleAsync(groupId, name)),
        removeSingleGroupMemberAsync: (groupId, name) =>
            dispatch(GroupMemberActions.removeSingleGroupMemberAsync(groupId, name))
    })
)(GroupMembers)
