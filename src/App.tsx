import Button from "@components/Button/default";
import ButtonGroup from "@components/Button/group";
import IconButton from "@components/Button/icon";
import SplitButton from "@components/Button/split";
import Chip from "@components/Chip";
import Dialog, { DialogActions } from "@components/Dialog";
import Icon from "@components/Icon";
import Select, { Option } from "@components/Select";
import Slider from "@components/Slider";
import TextField from "@components/TextField";
import Tooltip from "@components/Tooltip";
import { useCallback, useState } from "react";
import { useConcatElementRef, useResizeObserver } from "react-dom-event-hooks";
import Panes, { Pane } from "../lib/layouts/Panes";
import Tab from "../lib/layouts/Tabs/Tab";
import Tabs from "../lib/layouts/Tabs/Tabs";
import NumberField from "@components/NumberField";
import Content from "../lib/layouts/Content";
import MenuItem from "@components/Menu/MenuItem";
import MenuGroup from "@components/Menu/MenuGroup";
import Menu from "@components/Menu";
import ContextMenu from "@components/ContextMenu";
import Page from "../lib/layouts/Page";
import Toolbar from "@components/Toolbar";
import Menubar from "@components/Menubar";
import MenuSection from "@components/Menubar/MenuSection";
import Toolbox from "../lib/layouts/Toolbox";
import reactLogo from './assets/react.svg';

export default function App()
{
	const [open, setOpen] = useState(false);
	const [open2, setOpen2] = useState(false);
	const [visible, setVisible] = useState(false);
	const [swap, setSwap] = useState(false);
	const [count, setCount] = useState(0);
	const elem = useResizeObserver(useCallback(() =>
	{
		// console.log("RESIZE DIV");
	}, []));
	const [value, setValue] = useState<(string | number)[]>([]);
	const [selected, setSelected] = useState<string>();
	const {saveRef} = useConcatElementRef(elem);

	return (

		<Page>
			<Menubar data-test icon={<img src={reactLogo}/>}>
			{/* <Menubar data-test icon="google_home_devices"> */}
				<MenuSection label="Fichier">
					<MenuItem text={selected => selected ? "Selected" : "Unselected"} selectable/>
					<MenuItem text={"Toto 1"}/>
					<MenuItem text={"Toto 2"}/>
				</MenuSection>
				<MenuSection label="Édition">
					<MenuGroup>
						<MenuItem icon="undo" text={"Annuler"}/>
						<MenuItem icon="redo" text={"Rétabir"}/>
					</MenuGroup>
					<MenuGroup>
						<MenuItem icon="content_copy" text={"Copier"}/>
						<MenuItem icon="content_cut" text={"Couper"}/>
						<MenuItem icon="content_paste" text={"Coller"}/>
					</MenuGroup>
				</MenuSection>
				<Content>
					<form>
						<ButtonGroup type="connected" selectable="single" required>
							<Button color="elevated" size="small" icon="add_chart" label="Test"/>
							<Button color="filled" size="small" icon="add_chart" label="Test"/>
							<Button color="tonal" size="small" icon="add_chart" label="Test"/>
							<Button color="tertiary" size="small" icon="add_chart" label="Test"/>
						</ButtonGroup>
						<button>Valider</button>
					</form>
				</Content>
			</Menubar>
			<ContextMenu layout="grouped" density={-2}>
				<MenuItem text={"Test 1"} selectable/>
				<MenuItem text={"Test 2"}>
					<MenuItem text={"Toto 1"}/>
					<MenuItem text={"Toto 2"}/>
					<MenuGroup>
						<MenuItem icon="content_copy" text={"Copier"}/>
						<MenuItem icon="content_paste" text={"Coller"}/>
					</MenuGroup>
				</MenuItem>
				<MenuGroup>
					<MenuItem icon="content_copy" text={"Copier"}/>
					<MenuItem icon="content_paste" text={"Coller"}/>
				</MenuGroup>
			</ContextMenu>
			<Toolbar variant="floating" orientation="vertical">
				<Button icon="edit" label="Test 2" selectable/>
				<IconButton title="Test" icon="share" selectable width="wide"/>
				<IconButton icon="comment"/>
				<Button icon="add_chart" label="Test"/>
				<Button icon="edit" label="Test 2" selectable/>
			</Toolbar>
			<Toolbar variant="docked" align="center">
				<Button icon="edit" label="Test 2" selectable/>
				<IconButton title="Test" icon="share" selectable width="wide"/>
				<IconButton icon="comment"/>
				<Button icon="add_chart" label="Test"/>
				<Button icon="edit" label="Test 2" selectable/>
			</Toolbar>
			<Content>
				<div ref={saveRef}>CONTENT {visible ? "true" : "false"}</div>
				<button onClick={() => setVisible(visible => !visible)}>Swap<Tooltip variant="plain" text="Tooltip"/></button>
			 	<Panes autoSaveId="t2">
			 		<Pane id="pane1">
			 			<Panes orientation="vertical" autoSaveId="t2">
			 				<Pane id="pane2">Test 1</Pane>
			 				<Pane id="pane3">Test 2</Pane>
			 			</Panes>
			 		</Pane>
			 		<Pane id="pane4" snapPoints={[412, "50%"]} contentPadding>
			 			Test 3
			 			<Menu>
			 				<MenuItem text={"Test 1"}/>
			 				<MenuItem text={"Test 2"}>
			 					<MenuItem text={"Toto 1"}/>
			 					<MenuItem text={"Toto 2"}/>
			 					<MenuGroup>
			 						<MenuItem icon="content_copy" text={"Copier"}/>
			 						<MenuItem icon="content_paste" text={"Coller"}/>
			 					</MenuGroup>
			 				</MenuItem>
			 				<MenuGroup label="Edition">
			 					<MenuItem icon="content_copy" text={"Copier"}/>
			 					<MenuItem icon="content_paste" text={"Coller"}/>
			 				</MenuGroup>
			 			</Menu>
			 		</Pane>
			 		<Pane id="pane5" snapPoints={[412, "50%"]}>
			 			<Tabs variant="secondary" defaultActiveTab="test3">
			 				{visible && <Tab id="test0" label="Tab 0" icon="tab">Tab 0 content</Tab>}
			 				<Tab id="test1" label="Tab 1" icon="tab">Tab 1 content</Tab>
			 				<Tab id="test2" label="Tab 2" icon="tab_close" contentPadding>Tab 2 content</Tab>
			 				<Tab id="test3" label="Console" icon="code">
								<Toolbox contentPadding>
									<ButtonGroup position="top" required type="connected" selectable="single" selected={selected} onSelected={setSelected}>
										<Button id="2d" label="2D View" icon="2d_2"/>
										<Button id="3d" label="3D View" icon="3d_2" selected/>
									</ButtonGroup>
									<Toolbar variant="floating" orientation="vertical" color="vibrant">
										<Button icon="edit" label="Test 2" selectable/>
										<IconButton icon="share" selectable/>
										<IconButton icon="comment"/>
										<Button icon="add_chart" label="Test"/>
										<Button icon="edit" label="Test 2" selectable/>
									</Toolbar>
									<ButtonGroup position="top" type="connected" selectable="single">
										<Button color="elevated" size="small" icon="add_chart" label="Test"/>
										<Button color="filled" size="small" icon="add_chart" label="Test"/>
										<Button color="tonal" size="small" icon="add_chart" label="Test"/>
										<Button color="tertiary" size="small" icon="add_chart" label="Test"/>
									</ButtonGroup>
									<Content>
										Tab 3 content<br/>
										Test 4
										<br/>
										<Button label="Inc" onClick={() => setCount(count => count + 1)}/><br/>
										Count: {count}
										<Toolbar variant="floating">
											<Button icon="edit" label="Test 2" selectable/>
											<IconButton icon="share" selectable/>
											<IconButton icon="comment"/>
											<Button icon="add_chart" label="Test"/>
											<Button icon="edit" label="Test 2" selectable/>
										</Toolbar>
										<Toolbar variant="floating" color="vibrant">
											<Button icon="edit" label="Test 2" selectable/>
											<IconButton icon="share" selectable/>
											<IconButton icon="comment"/>
											<Button icon="add_chart" label="Test"/>
											<Button icon="edit" label="Test 2" selectable/>
										</Toolbar>
										<Toolbar variant="docked">
											<IconButton icon="edit"/>
											<IconButton icon="add"/>
											<Button icon="add_chart" label="Test"/>
										</Toolbar>
									</Content>
								</Toolbox>
			 				</Tab>
			 			</Tabs>
			 		</Pane>
			 		{/* <Pane>Test 3</Pane> */}
			 	</Panes>
				<button style={{marginInline: 500, height: 100}}>
					Tooltip
					<Tooltip variant="plain" text="Le placement actuel"/>
				</button>
				<br/>
				<IconButton size="extra-small" icon="add_chart"/>
				<Button size="extra-small" icon="add_chart"/>
				<Button size="extra-small" icon="add_chart" label="Test"/>
				<Button size="extra-small" label="Test"/><br/>
				<IconButton size="small" icon="add_chart"/>
				<Button size="small" icon="add_chart"/>
				<Button size="small" icon="add_chart" label="Test"/>
				<Button size="small" label="Test"/><br/>
				<IconButton size="medium" icon="add_chart"/>
				<Button size="medium" icon="add_chart"/>
				<Button size="medium" icon="add_chart" label="Test"/>
				<Button size="medium" label="Test"/><br/>
				<IconButton size="large" icon="add_chart"/>
				<Button size="large" icon="add_chart"/>
				<Button size="large" icon="add_chart" label="Test"/>
				<Button size="large" label="Test"/><br/>
				<IconButton size="extra-large" icon="add_chart"/>
				<Button size="extra-large" icon="add_chart"/>
				<Button size="extra-large" icon="add_chart" label="Test"/>
				<Button size="extra-large" label="Test"/><br/>
					{/* <MenuGroup>
						<MenuItem icon="undo" text={"Annuler"}/>
						<MenuItem icon="redo" text={"Rétabir"}/>
						<MenuItem icon="content_paste" text={"Coller"}/>
					</MenuGroup>
					<MenuGroup>
						<MenuItem icon="content_copy" text={"Copier"}/>
						<MenuItem icon="content_cut" text={"Couper"}/>
						<MenuItem icon="content_paste" text={"Coller"}/>
					</MenuGroup> */}
					{/* <MenuItem text={"Test 1"} selectable onClick={() => console.log("CLICK TEST1")}/>
					<MenuItem text={"Test 2"} onClick={() => console.log("CLICK TEST2")}/>
					<MenuItem text={"Test 3"} onClick={() => console.log("CLICK TEST3")}/> */}
				{/* </Button> */}
				<ButtonGroup type="standard" shape="round" size="large" selectable="multiple">
					<Button color="elevated" size="small" icon="add_chart" label="Test"/>
					<Button color="filled" size="small" icon="add_chart" label="Test"/>
					<Button color="tonal" size="small" icon="add_chart" label="Test"/>
					<Button color="tertiary" size="small" icon="add_chart" label="Test"/>
					<Button color="success" size="small" icon="add_chart" label="Test"/>
					<Button color="error" size="small" icon="add_chart" label="Test"/>
					<Button selectable icon="adjust" label={selected => !selected ? "Test" : "Long test"}/>
					{/* <Button color="elevated" size="small" selectable icon="add_chart" label={selected => !selected ? "Test" : "Long test"}/> */}
					<IconButton selectable icon="star" color="standard"/>
					<IconButton selectable icon="star" width="narrow"/>
					<IconButton selectable icon="star" width="default"/>
					<IconButton selectable icon="star" width="wide"/>
				</ButtonGroup>
				<ButtonGroup type="connected" size="large" selectable="single">
					<Button color="elevated" size="small" icon="add_chart" label="Test"/>
					<Button color="filled" size="small" icon="add_chart" label="Test"/>
					<Button color="tonal" size="small" icon="add_chart" label="Test"/>
					<Button color="tertiary" size="small" icon="add_chart" label="Test"/>
					<Button color="success" size="small" icon="add_chart" label="Test"/>
					<Button color="error" size="small" icon="add_chart" label="Test"/>
					<Button selectable icon="adjust" label={selected => !selected ? "Test" : "Long test"}/>
					<Button color="elevated" size="small" selectable icon="add_chart" label={selected => !selected ? "Test" : "Long test"}/>
				</ButtonGroup>
				<ButtonGroup type="connected" size="large" selectable="multiple">
					<Button color="elevated" size="small" icon="add_chart" label="Test"/>
					<Button color="filled" size="small" icon="add_chart" label="Test"/>
					<Button color="tonal" size="small" icon="add_chart" label="Test"/>
					<Button color="tertiary" size="small" icon="add_chart" label="Test"/>
					<Button color="success" size="small" icon="add_chart" label="Test"/>
					<Button color="error" size="small" icon="add_chart" label="Test"/>
					<Button selectable icon="adjust" label={selected => !selected ? "Test" : "Long test"}/>
					<Button color="elevated" size="small" selectable icon="add_chart" label={selected => !selected ? "Test" : "Long test"}/>
				</ButtonGroup>
				<IconButton selectable icon="edit" onClick={() => setOpen(true)}/>
				<br/>
				<SplitButton color="filled" label="test" size="extra-small"/>
				<SplitButton color="tonal" label="test" size="extra-small"/>
				<SplitButton color="tertiary" label="test" size="extra-small"/>
				<SplitButton color="success" label="test" size="extra-small"/>
				<SplitButton color="error" label="test" size="extra-small"/><br/>
				<SplitButton color="filled" label="test" size="small"/>
				<SplitButton color="tonal" label="test" size="small"/>
				<SplitButton color="tertiary" label="test" size="small"/>
				<SplitButton color="success" label="test" size="small"/>
				<SplitButton color="error" label="test" size="small"/><br/>
				<SplitButton color="filled" label="test" size="medium"/>
				<SplitButton color="tonal" label="test" size="medium"/>
				<SplitButton color="tertiary" label="test" size="medium"/>
				<SplitButton color="success" label="test" size="medium"/>
				<SplitButton color="error" label="test" size="medium"/><br/>
				<SplitButton color="filled" label="test" size="large"/>
				<SplitButton color="tonal" label="test" size="large"/>
				<SplitButton color="tertiary" label="test" size="large"/>
				<SplitButton color="success" label="test" size="large"/>
				<SplitButton color="error" label="test" size="large"/><br/>
				<SplitButton color="filled" label="test" size="extra-large"/>
				<SplitButton color="tonal" label="test" size="extra-large"/>
				<SplitButton color="tertiary" label="test" size="extra-large"/>
				<SplitButton color="success" label="test" size="extra-large"/>
				<SplitButton color="error" label="test">
					<MenuItem text={"Test 1"}/>
					<MenuItem text={"Test 2"}/>
					<MenuItem text={"Test 3"}/>
				</SplitButton><br/>
				<Button color="elevated" size="small" selectable icon="add_chart" label="Test"/>
				<Button draggable color="filled" size="small" selectable icon="add_chart" label="Test"/>
				<Button color="tonal" size="small" selectable icon="add_chart" label="Test"/>
				<Button color="tertiary" size="small" selectable icon="add_chart" label="Test"/>
				<Button color="success" size="small" selectable icon="add_chart" label="Test"/>
				<Button color="error" size="small" selectable icon="add_chart" label="Test"/>
				<Button color="outlined" size="small" selectable icon="add_chart" label="Test"/>
				<Button color="text" size="small" icon="add_chart" label="Test"/>
				<Button color="elevated" size="small" selectable icon="add_chart" label={selected => !selected ? "Test" : "Long test"}/>
				<Button color="filled" size="small" selectable icon="add_chart" label={selected => !selected ? "Test" : "Long test"}/>
				<Button color="tonal" size="small" selectable icon={selected => selected ? "check" : undefined} label={selected => !selected ? "Test" : "Long test"}/>
				<Button color="tertiary" size="small" selectable icon={selected => selected ? "check" : undefined} label={selected => !selected ? "Test" : "Long test"}/>
				<Button color="success" size="small" selectable icon={selected => selected ? "check" : undefined} label={selected => !selected ? "Test" : "Long test"}/>
				<Button color="error" size="small" selectable icon={selected => selected ? "check" : undefined} label={selected => !selected ? "Test" : "Long test"}/>
				<Button color="outlined" size="small" selectable icon={selected => selected ? "check" : "add_chart"} label={selected => !selected ? "Test" : "Long test"}/>
				<Button color="text" size="small" icon="add_chart" label="Test"/>
				<Icon name="star" size={32} fill/><br/>
				<Button disabled color="elevated" size="small" selectable icon="add_chart" label={selected => !selected ? "Test" : "Long test"}/>
				<Button disabled color="filled" size="small" selectable icon="add_chart" label={selected => !selected ? "Test" : "Long test"}/>
				<Button disabled color="tonal" size="small" selectable icon="add_chart" label={selected => !selected ? "Test" : "Long test"}/>
				<Button disabled color="tertiary" size="small" selectable icon="add_chart" label={selected => !selected ? "Test" : "Long test"}/>
				<Button disabled color="success" size="small" selectable icon="add_chart" label={selected => !selected ? "Test" : "Long test"}/>
				<Button disabled color="error" size="small" selectable icon="add_chart" label={selected => !selected ? "Test" : "Long test"}/>
				<Button disabled color="outlined" size="small" selectable icon="add_chart" label={selected => !selected ? "Test" : "Long test"}/>
				<Button disabled color="text" size="small" icon="add_chart" label="Test"/><br/>

				<IconButton color="filled" size="extra-small" icon="home"/>
				<IconButton color="tonal" size="extra-small" icon="home"/>
				<IconButton color="tertiary" size="extra-small" icon="home"/>
				<IconButton color="success" size="extra-small" icon="home"/>
				<IconButton color="error" size="extra-small" icon="home"/>
				<IconButton color="outlined" size="extra-small" icon="home"/>
				<IconButton color="standard" size="extra-small" icon="home"/><br/>
				<IconButton color="filled" icon="home"/>
				<IconButton color="tonal" icon="home"/>
				<IconButton color="tertiary" icon="home"/>
				<IconButton color="success" icon="home"/>
				<IconButton color="error" icon="home"/>
				<IconButton color="outlined" icon="home"/>
				<IconButton color="standard" icon="home"/><br/>
				<IconButton color="filled" size="medium" icon="home"/>
				<IconButton color="tonal" size="medium" icon="home"/>
				<IconButton color="tertiary" size="medium" icon="home"/>
				<IconButton color="success" size="medium" icon="home"/>
				<IconButton color="error" size="medium" icon="home"/>
				<IconButton color="outlined" size="medium" icon="home"/>
				<IconButton color="standard" size="medium" icon="home"/><br/>
				<IconButton color="filled" size="large" icon="home"/>
				<IconButton color="tonal" size="large" icon="home"/>
				<IconButton color="tertiary" size="large" icon="home"/>
				<IconButton color="success" size="large" icon="home"/>
				<IconButton color="error" size="large" icon="home"/>
				<IconButton color="outlined" size="large" icon="home"/>
				<IconButton color="standard" size="large" icon="home"/><br/>
				<IconButton color="filled" size="extra-large" icon="home"/>
				<IconButton color="tonal" size="extra-large" icon="home"/>
				<IconButton color="tertiary" size="extra-large" icon="home"/>
				<IconButton color="success" size="extra-large" icon="home"/>
				<IconButton color="error" size="extra-large" icon="home"/>
				<IconButton color="outlined" size="extra-large" icon="home"/>
				<IconButton color="standard" size="extra-large" icon="home"/><br/>
				<IconButton disabled color="filled" size="extra-large" icon="home"/>
				<IconButton disabled color="tonal" size="extra-large" icon="home"/>
				<IconButton disabled color="tertiary" size="extra-large" icon="home"/>
				<IconButton disabled color="success" size="extra-large" icon="home"/>
				<IconButton disabled color="error" size="extra-large" icon="home"/>
				<IconButton disabled color="outlined" size="extra-large" icon="home"/>
				<IconButton disabled color="standard" size="extra-large" icon="home"/><br/>
				<br/>
				<IconButton selectable color="filled" size="extra-small" icon="home"/>
				<IconButton selectable color="tonal" size="extra-small" icon="home"/>
				<IconButton selectable color="tertiary" size="extra-small" icon="home"/>
				<IconButton selectable color="success" size="extra-small" icon="home"/>
				<IconButton selectable color="error" size="extra-small" icon="home"/>
				<IconButton selectable color="outlined" size="extra-small" icon="home"/>
				<IconButton selectable color="standard" size="extra-small" icon="home"/><br/>
				<IconButton selectable color="filled" icon="home"/>
				<IconButton selectable color="tonal" icon="home"/>
				<IconButton selectable color="tertiary" icon="home"/>
				<IconButton selectable color="success" icon="home"/>
				<IconButton selectable color="error" icon="home"/>
				<IconButton selectable color="outlined" icon="home"/>
				<IconButton selectable color="standard" icon="home"/><br/>
				<IconButton selectable color="filled" size="medium" icon="home"/>
				<IconButton selectable color="tonal" size="medium" icon="home"/>
				<IconButton selectable color="tertiary" size="medium" icon="home"/>
				<IconButton selectable color="success" size="medium" icon="home"/>
				<IconButton selectable color="error" size="medium" icon="home"/>
				<IconButton selectable color="outlined" size="medium" icon="home"/>
				<IconButton selectable color="standard" size="medium" icon="home"/><br/>
				<IconButton selectable color="filled" size="large" icon="home"/>
				<IconButton selectable color="tonal" size="large" icon="home"/>
				<IconButton selectable color="tertiary" size="large" icon="home"/>
				<IconButton selectable color="success" size="large" icon="home"/>
				<IconButton selectable color="error" size="large" icon="home"/>
				<IconButton selectable color="outlined" size="large" icon="home"/>
				<IconButton selectable color="standard" size="large" icon="home"/><br/>
				<IconButton selectable color="filled" size="extra-large" icon="home"/>
				<IconButton selectable color="tonal" size="extra-large" icon="home"/>
				<IconButton selectable color="tertiary" size="extra-large" icon="home"/>
				<IconButton selectable color="success" size="extra-large" icon="home"/>
				<IconButton selectable color="error" size="extra-large" icon="home"/>
				<IconButton selectable color="outlined" size="extra-large" icon="home"/>
				<IconButton selectable color="standard" size="extra-large" icon="home"/><br/>
				<IconButton selectable disabled color="filled" size="extra-large" icon="home"/>
				<IconButton selectable disabled color="tonal" size="extra-large" icon="home"/>
				<IconButton selectable disabled color="tertiary" size="extra-large" icon="home"/>
				<IconButton selectable disabled color="success" size="extra-large" icon="home"/>
				<IconButton selectable disabled color="error" size="extra-large" icon="home"/>
				<IconButton selectable disabled color="outlined" size="extra-large" icon="home"/>
				<IconButton selectable disabled color="standard" size="extra-large" icon="home"/><br/>
				<br/>
				<Chip variant="assist" label="Test" />
				<Chip variant="assist" icon="holiday_village" label="Test" />
				<Chip variant="assist" label="Test" elevated/>
				<Chip variant="assist" icon="holiday_village" label="Test" elevated/>
				<Chip variant="filter" label="Test"/>
				<Chip variant="filter" label="Test" elevated/>
				<Chip icon="holiday_village" variant="input" label="Test"/>
				<Chip icon="holiday_village" variant="input" label="Test" selectable/>
				<Chip onClick={() => console.log("CHIP CLICKED !")}  icon="holiday_village" variant="input" label="Test" deletable/>
				<Chip icon="holiday_village" variant="input" label="Test" selectable deletable/>
				<Chip variant="input" label="Test"/>
				<Chip variant="input" label="Test" selectable/>
				<Chip variant="input" label="Test" deletable/>
				<Chip variant="input" label="Test" selectable deletable/>
				<Chip variant="suggestion" label="Test"/>
				<Chip variant="suggestion" label="Test" elevated/>
				<Chip variant="suggestion" icon="holiday_village" label="Test"/>
				<Chip variant="suggestion" icon="holiday_village" label="Test" elevated/>
				<br/>
				<br/>
				<form>
					<TextField label="Label" minLength={10} placeholder="Placeholder test" required leadingIcon="search"/>
					<TextField label="Label" minLength={10} required suffix="@gmail.com" leadingIcon="search"/>
					<TextField prefix="test" label="Label" minLength={3} maxLength={30} counter={false} required clearable/><br/><br/>
					<NumberField label="Number" hugeStep={10} max={100} required /* trailingIcon={<Icon name="search"/>} *//><br/><br/>
					<NumberField shape="filled" label="Number" required trailingIcon="search"/><br/><br/>
					<TextField shape="filled" label="Label" minLength={3} maxLength={30} counter={false} required/><br/><br/>
					<Button selectable label="SWAP" icon="swap_horiz" type="button" selected={swap} onClick={() => setSwap(swap => !swap)}/>
					<Select
						// shape="filled"
						label="Test"
						value={value}
						// searchable
						multiple
						clearable
						onValueChange={value => {console.log("VALUE CHANGED", value); setValue(value)}}
						// searchable
						required
					>
						<Option value="test1"/>
						<Option value="test2" label={!swap ? "Test 2" : "Swapped Test 2"}/>
						<Option value="test3"/>
						<Option value="test4"/>
						<Option value="test5"/>
					</Select>
						<br/><br/>
					<button type="submit">Envoyer</button>
				</form>

				<Slider stopIndicator/>
				<Slider stopIndicator size="small"/>
				<Slider stopIndicator size="medium"/>
				<Slider stopIndicator size="large"/>
				<Slider stopIndicator size="extra-large"/>
				<Dialog
					fullscreen
					buttonLabel="Enregistrer"
					// size="medium"
					// icon="restart_alt"
					headline="Reset settings?"
					// supportingText="This will reset your app preferences back to their default settings. The following accounts will also be signed out:"
					open={open2}
					onClose={() => setOpen2(false)}
				>
					<Content>
						Test
						<div style={{height: 1300, width: 150, backgroundColor: "red"}}/>
						<TextField label="Label" minLength={10} required/>
					</Content>
					<DialogActions>
						<Button label="Annuler" onClick={() => setOpen(false)}/>
						<Button label="Open sub dialog" onClick={() => setOpen2(true)}/>
					</DialogActions>
				</Dialog>
				<Dialog headline="Test" supportingText="Other dialog" open={open} onClose={() => {setOpen(false)}}>
					<Content>
						Test
						<div style={{height: 1300, width: 150, backgroundColor: "red"}}/>
					</Content>
					<DialogActions>
						<Button label="Open sub dialog 2" onClick={() => {setOpen2(true)}}/>
						<Button label="Close sub dialog" onClick={() => {setOpen(false)}}/>
					</DialogActions>
				</Dialog>
			</Content>
		</Page>

		// <>
		// 	<div ref={saveRef}>CONTENT {visible ? "true" : "false"}</div>
		// 	<button onClick={() => setVisible(visible => !visible)}>Swap<Tooltip variant="plain" text="Tooltip"/></button>
		// 	<br/>
		// 	<ContextMenu layout="grouped">
		// 		<MenuItem text={"Test 1"}/>
		// 		<MenuItem text={"Test 2"}>
		// 			<MenuItem text={"Toto 1"}/>
		// 			<MenuItem text={"Toto 2"}/>
		// 			<MenuGroup>
		// 				<MenuItem icon="content_copy" text={"Copier"}/>
		// 				<MenuItem icon="content_paste" text={"Coller"}/>
		// 			</MenuGroup>
		// 		</MenuItem>
		// 		<MenuGroup>
		// 			<MenuItem icon="content_copy" text={"Copier"}/>
		// 			<MenuItem icon="content_paste" text={"Coller"}/>
		// 		</MenuGroup>
		// 	</ContextMenu>
		// 	<br/>
		// 	<Panes autoSaveId="t1">
		// 		<Pane id="pane1">
		// 			<Panes orientation="vertical" autoSaveId="t2">
		// 				<Pane id="pane2">Test 1</Pane>
		// 				<Pane id="pane3">Test 2</Pane>
		// 			</Panes>
		// 		</Pane>
		// 		<Pane id="pane4" snapPoints={[412, "50%"]}>
		// 			Test 3
		// 			<Menu layout="grouped">
		// 				<MenuItem text={"Test 1"}/>
		// 				<MenuItem text={"Test 2"}>
		// 					<MenuItem text={"Toto 1"}/>
		// 					<MenuItem text={"Toto 2"}/>
		// 					<MenuGroup>
		// 						<MenuItem icon="content_copy" text={"Copier"}/>
		// 						<MenuItem icon="content_paste" text={"Coller"}/>
		// 					</MenuGroup>
		// 				</MenuItem>
		// 				<MenuGroup>
		// 					<MenuItem icon="content_copy" text={"Copier"}/>
		// 					<MenuItem icon="content_paste" text={"Coller"}/>
		// 				</MenuGroup>
		// 			</Menu>
		// 		</Pane>
		// 		<Pane id="pane5" snapPoints={[412, "50%"]}>
		// 			<Tabs variant="secondary" defaultActiveTab="test3">
		// 				{visible && <Tab id="test0" label="Tab 0" icon="tab">Tab 0 content</Tab>}
		// 				<Tab id="test1" label="Tab 1" icon="tab">Tab 1 content</Tab>
		// 				<Tab id="test2" label="Tab 2" icon="tab_close">Tab 2 content</Tab>
		// 				<Tab id="test3" label="Console" icon="code">
		// 					Tab 3 content<br/>
		// 					Test 4
		// 					<br/>
		// 					<Button label="Inc" onClick={() => setCount(count => count + 1)}/><br/>
		// 					Count: {count}
		// 					<Toolbar variant="floating">
		// 						<Button icon="edit" label="Test 2" selectable/>
		// 						<IconButton icon="share" selectable/>
		// 						<IconButton icon="comment"/>
		// 						<Button icon="add_chart" label="Test"/>
		// 						<Button icon="edit" label="Test 2" selectable/>
		// 					</Toolbar>
		// 					<Toolbar variant="floating" color="vibrant">
		// 						<Button icon="edit" label="Test 2" selectable/>
		// 						<IconButton icon="share" selectable/>
		// 						<IconButton icon="comment"/>
		// 						<Button icon="add_chart" label="Test"/>
		// 						<Button icon="edit" label="Test 2" selectable/>
		// 					</Toolbar>
		// 					<Toolbar variant="docked">
		// 						<IconButton icon="edit"/>
		// 						<IconButton icon="add"/>
		// 						<Button icon="add_chart" label="Test"/>
		// 					</Toolbar>
		// 				</Tab>
		// 			</Tabs>
		// 		</Pane>
		// 		<Pane>	Test 3</Pane>
		// 	</Panes>
		// 	<button style={{marginInline: 500, height: 100}}>
		// 		Tooltip
		// 		<Tooltip variant="plain" text="Le placement actuel"/>
		// 	</button>
		// 	<br/>
		// 	<Button title="Test" color="filled" size="small" icon="add_chart" label="Test">
		// 		<MenuItem text={"Test 1"}/>
		// 		<MenuItem text={"Test 2"}/>
		// 		<MenuItem text={"Test 3"}/>
		// 	</Button>
		// 	<ButtonGroup type="standard" shape="round" size="large" selectable="multiple">
		// 		<Button color="elevated" size="small" icon="add_chart" label="Test"/>
		// 		<Button color="filled" size="small" icon="add_chart" label="Test"/>
		// 		<Button color="tonal" size="small" icon="add_chart" label="Test"/>
		// 		<Button color="tertiary" size="small" icon="add_chart" label="Test"/>
		// 		<Button color="success" size="small" icon="add_chart" label="Test"/>
		// 		<Button color="error" size="small" icon="add_chart" label="Test"/>
		// 		<Button selectable icon="adjust" label={selected => !selected ? "Test" : "Long test"}/>
		// 		<Button color="elevated" size="small" selectable icon="add_chart" label={selected => !selected ? "Test" : "Long test"}/>
		// 		<IconButton selectable icon="star" color="standard"/>
		// 		<IconButton selectable icon="star" width="narrow"/>
		// 		<IconButton selectable icon="star" width="default"/>
		// 		<IconButton selectable icon="star" width="wide"/>
		// 	</ButtonGroup>
		// 	<ButtonGroup type="connected" size="large" selectable="single">
		// 		<Button color="elevated" size="small" icon="add_chart" label="Test"/>
		// 		<Button color="filled" size="small" icon="add_chart" label="Test"/>
		// 		<Button color="tonal" size="small" icon="add_chart" label="Test"/>
		// 		<Button color="tertiary" size="small" icon="add_chart" label="Test"/>
		// 		<Button color="success" size="small" icon="add_chart" label="Test"/>
		// 		<Button color="error" size="small" icon="add_chart" label="Test"/>
		// 		<Button selectable icon="adjust" label={selected => !selected ? "Test" : "Long test"}/>
		// 		<Button color="elevated" size="small" selectable icon="add_chart" label={selected => !selected ? "Test" : "Long test"}/>
		// 	</ButtonGroup>
		// 	<ButtonGroup type="connected" size="large" selectable="multiple">
		// 		<Button color="elevated" size="small" icon="add_chart" label="Test"/>
		// 		<Button color="filled" size="small" icon="add_chart" label="Test"/>
		// 		<Button color="tonal" size="small" icon="add_chart" label="Test"/>
		// 		<Button color="tertiary" size="small" icon="add_chart" label="Test"/>
		// 		<Button color="success" size="small" icon="add_chart" label="Test"/>
		// 		<Button color="error" size="small" icon="add_chart" label="Test"/>
		// 		<Button selectable icon="adjust" label={selected => !selected ? "Test" : "Long test"}/>
		// 		<Button color="elevated" size="small" selectable icon="add_chart" label={selected => !selected ? "Test" : "Long test"}/>
		// 	</ButtonGroup>
		// 	<IconButton selectable icon="edit" onClick={() => setOpen(true)}/>
		// 	<br/>
		// 	<SplitButton color="filled" label="test" size="extra-small"/>
		// 	<SplitButton color="tonal" label="test" size="extra-small"/>
		// 	<SplitButton color="tertiary" label="test" size="extra-small"/>
		// 	<SplitButton color="success" label="test" size="extra-small"/>
		// 	<SplitButton color="error" label="test" size="extra-small"/><br/>
		// 	<SplitButton color="filled" label="test" size="small"/>
		// 	<SplitButton color="tonal" label="test" size="small"/>
		// 	<SplitButton color="tertiary" label="test" size="small"/>
		// 	<SplitButton color="success" label="test" size="small"/>
		// 	<SplitButton color="error" label="test" size="small"/><br/>
		// 	<SplitButton color="filled" label="test" size="medium"/>
		// 	<SplitButton color="tonal" label="test" size="medium"/>
		// 	<SplitButton color="tertiary" label="test" size="medium"/>
		// 	<SplitButton color="success" label="test" size="medium"/>
		// 	<SplitButton color="error" label="test" size="medium"/><br/>
		// 	<SplitButton color="filled" label="test" size="large"/>
		// 	<SplitButton color="tonal" label="test" size="large"/>
		// 	<SplitButton color="tertiary" label="test" size="large"/>
		// 	<SplitButton color="success" label="test" size="large"/>
		// 	<SplitButton color="error" label="test" size="large"/><br/>
		// 	<SplitButton color="filled" label="test" size="extra-large"/>
		// 	<SplitButton color="tonal" label="test" size="extra-large"/>
		// 	<SplitButton color="tertiary" label="test" size="extra-large"/>
		// 	<SplitButton color="success" label="test" size="extra-large"/>
		// 	<SplitButton color="error" label="test">
		// 		<MenuItem text={"Test 1"}/>
		// 		<MenuItem text={"Test 2"}/>
		// 		<MenuItem text={"Test 3"}/>
		// 	</SplitButton><br/>
		// 	<Button color="elevated" size="small" selectable icon="add_chart" label="Test"/>
		// 	<Button draggable color="filled" size="small" selectable icon="add_chart" label="Test"/>
		// 	<Button color="tonal" size="small" selectable icon="add_chart" label="Test"/>
		// 	<Button color="tertiary" size="small" selectable icon="add_chart" label="Test"/>
		// 	<Button color="success" size="small" selectable icon="add_chart" label="Test"/>
		// 	<Button color="error" size="small" selectable icon="add_chart" label="Test"/>
		// 	<Button color="outlined" size="small" selectable icon="add_chart" label="Test"/>
		// 	<Button color="text" size="small" icon="add_chart" label="Test"/>
		// 	<Button color="elevated" size="small" selectable icon="add_chart" label={selected => !selected ? "Test" : "Long test"}/>
		// 	<Button color="filled" size="small" selectable icon="add_chart" label={selected => !selected ? "Test" : "Long test"}/>
		// 	<Button color="tonal" size="small" selectable icon={selected => selected ? "check" : undefined} label={selected => !selected ? "Test" : "Long test"}/>
		// 	<Button color="tertiary" size="small" selectable icon={selected => selected ? "check" : undefined} label={selected => !selected ? "Test" : "Long test"}/>
		// 	<Button color="success" size="small" selectable icon={selected => selected ? "check" : undefined} label={selected => !selected ? "Test" : "Long test"}/>
		// 	<Button color="error" size="small" selectable icon={selected => selected ? "check" : undefined} label={selected => !selected ? "Test" : "Long test"}/>
		// 	<Button color="outlined" size="small" selectable icon={selected => selected ? "check" : "add_chart"} label={selected => !selected ? "Test" : "Long test"}/>
		// 	<Button color="text" size="small" icon="add_chart" label="Test"/>
		// 	<Icon name="star" size={32} fill/><br/>
		// 	<Button disabled color="elevated" size="small" selectable icon="add_chart" label={selected => !selected ? "Test" : "Long test"}/>
		// 	<Button disabled color="filled" size="small" selectable icon="add_chart" label={selected => !selected ? "Test" : "Long test"}/>
		// 	<Button disabled color="tonal" size="small" selectable icon="add_chart" label={selected => !selected ? "Test" : "Long test"}/>
		// 	<Button disabled color="tertiary" size="small" selectable icon="add_chart" label={selected => !selected ? "Test" : "Long test"}/>
		// 	<Button disabled color="success" size="small" selectable icon="add_chart" label={selected => !selected ? "Test" : "Long test"}/>
		// 	<Button disabled color="error" size="small" selectable icon="add_chart" label={selected => !selected ? "Test" : "Long test"}/>
		// 	<Button disabled color="outlined" size="small" selectable icon="add_chart" label={selected => !selected ? "Test" : "Long test"}/>
		// 	<Button disabled color="text" size="small" icon="add_chart" label="Test"/><br/>

		// 	<IconButton color="filled" size="extra-small" icon="home"/>
		// 	<IconButton color="tonal" size="extra-small" icon="home"/>
		// 	<IconButton color="tertiary" size="extra-small" icon="home"/>
		// 	<IconButton color="success" size="extra-small" icon="home"/>
		// 	<IconButton color="error" size="extra-small" icon="home"/>
		// 	<IconButton color="outlined" size="extra-small" icon="home"/>
		// 	<IconButton color="standard" size="extra-small" icon="home"/><br/>
		// 	<IconButton color="filled" icon="home"/>
		// 	<IconButton color="tonal" icon="home"/>
		// 	<IconButton color="tertiary" icon="home"/>
		// 	<IconButton color="success" icon="home"/>
		// 	<IconButton color="error" icon="home"/>
		// 	<IconButton color="outlined" icon="home"/>
		// 	<IconButton color="standard" icon="home"/><br/>
		// 	<IconButton color="filled" size="medium" icon="home"/>
		// 	<IconButton color="tonal" size="medium" icon="home"/>
		// 	<IconButton color="tertiary" size="medium" icon="home"/>
		// 	<IconButton color="success" size="medium" icon="home"/>
		// 	<IconButton color="error" size="medium" icon="home"/>
		// 	<IconButton color="outlined" size="medium" icon="home"/>
		// 	<IconButton color="standard" size="medium" icon="home"/><br/>
		// 	<IconButton color="filled" size="large" icon="home"/>
		// 	<IconButton color="tonal" size="large" icon="home"/>
		// 	<IconButton color="tertiary" size="large" icon="home"/>
		// 	<IconButton color="success" size="large" icon="home"/>
		// 	<IconButton color="error" size="large" icon="home"/>
		// 	<IconButton color="outlined" size="large" icon="home"/>
		// 	<IconButton color="standard" size="large" icon="home"/><br/>
		// 	<IconButton color="filled" size="extra-large" icon="home"/>
		// 	<IconButton color="tonal" size="extra-large" icon="home"/>
		// 	<IconButton color="tertiary" size="extra-large" icon="home"/>
		// 	<IconButton color="success" size="extra-large" icon="home"/>
		// 	<IconButton color="error" size="extra-large" icon="home"/>
		// 	<IconButton color="outlined" size="extra-large" icon="home"/>
		// 	<IconButton color="standard" size="extra-large" icon="home"/><br/>
		// 	<IconButton disabled color="filled" size="extra-large" icon="home"/>
		// 	<IconButton disabled color="tonal" size="extra-large" icon="home"/>
		// 	<IconButton disabled color="tertiary" size="extra-large" icon="home"/>
		// 	<IconButton disabled color="success" size="extra-large" icon="home"/>
		// 	<IconButton disabled color="error" size="extra-large" icon="home"/>
		// 	<IconButton disabled color="outlined" size="extra-large" icon="home"/>
		// 	<IconButton disabled color="standard" size="extra-large" icon="home"/><br/>
		// 	<br/>
		// 	<IconButton selectable color="filled" size="extra-small" icon="home"/>
		// 	<IconButton selectable color="tonal" size="extra-small" icon="home"/>
		// 	<IconButton selectable color="tertiary" size="extra-small" icon="home"/>
		// 	<IconButton selectable color="success" size="extra-small" icon="home"/>
		// 	<IconButton selectable color="error" size="extra-small" icon="home"/>
		// 	<IconButton selectable color="outlined" size="extra-small" icon="home"/>
		// 	<IconButton selectable color="standard" size="extra-small" icon="home"/><br/>
		// 	<IconButton selectable color="filled" icon="home"/>
		// 	<IconButton selectable color="tonal" icon="home"/>
		// 	<IconButton selectable color="tertiary" icon="home"/>
		// 	<IconButton selectable color="success" icon="home"/>
		// 	<IconButton selectable color="error" icon="home"/>
		// 	<IconButton selectable color="outlined" icon="home"/>
		// 	<IconButton selectable color="standard" icon="home"/><br/>
		// 	<IconButton selectable color="filled" size="medium" icon="home"/>
		// 	<IconButton selectable color="tonal" size="medium" icon="home"/>
		// 	<IconButton selectable color="tertiary" size="medium" icon="home"/>
		// 	<IconButton selectable color="success" size="medium" icon="home"/>
		// 	<IconButton selectable color="error" size="medium" icon="home"/>
		// 	<IconButton selectable color="outlined" size="medium" icon="home"/>
		// 	<IconButton selectable color="standard" size="medium" icon="home"/><br/>
		// 	<IconButton selectable color="filled" size="large" icon="home"/>
		// 	<IconButton selectable color="tonal" size="large" icon="home"/>
		// 	<IconButton selectable color="tertiary" size="large" icon="home"/>
		// 	<IconButton selectable color="success" size="large" icon="home"/>
		// 	<IconButton selectable color="error" size="large" icon="home"/>
		// 	<IconButton selectable color="outlined" size="large" icon="home"/>
		// 	<IconButton selectable color="standard" size="large" icon="home"/><br/>
		// 	<IconButton selectable color="filled" size="extra-large" icon="home"/>
		// 	<IconButton selectable color="tonal" size="extra-large" icon="home"/>
		// 	<IconButton selectable color="tertiary" size="extra-large" icon="home"/>
		// 	<IconButton selectable color="success" size="extra-large" icon="home"/>
		// 	<IconButton selectable color="error" size="extra-large" icon="home"/>
		// 	<IconButton selectable color="outlined" size="extra-large" icon="home"/>
		// 	<IconButton selectable color="standard" size="extra-large" icon="home"/><br/>
		// 	<IconButton selectable disabled color="filled" size="extra-large" icon="home"/>
		// 	<IconButton selectable disabled color="tonal" size="extra-large" icon="home"/>
		// 	<IconButton selectable disabled color="tertiary" size="extra-large" icon="home"/>
		// 	<IconButton selectable disabled color="success" size="extra-large" icon="home"/>
		// 	<IconButton selectable disabled color="error" size="extra-large" icon="home"/>
		// 	<IconButton selectable disabled color="outlined" size="extra-large" icon="home"/>
		// 	<IconButton selectable disabled color="standard" size="extra-large" icon="home"/><br/>
		// 	<br/>
		// 	<Chip variant="assist" label="Test" />
		// 	<Chip variant="assist" icon="holiday_village" label="Test" />
		// 	<Chip variant="assist" label="Test" elevated/>
		// 	<Chip variant="assist" icon="holiday_village" label="Test" elevated/>
		// 	<Chip variant="filter" label="Test"/>
		// 	<Chip variant="filter" label="Test" elevated/>
		// 	<Chip icon="holiday_village" variant="input" label="Test"/>
		// 	<Chip icon="holiday_village" variant="input" label="Test" selectable/>
		// 	<Chip onClick={() => console.log("CHIP CLICKED !")}  icon="holiday_village" variant="input" label="Test" deletable/>
		// 	<Chip icon="holiday_village" variant="input" label="Test" selectable deletable/>
		// 	<Chip variant="input" label="Test"/>
		// 	<Chip variant="input" label="Test" selectable/>
		// 	<Chip variant="input" label="Test" deletable/>
		// 	<Chip variant="input" label="Test" selectable deletable/>
		// 	<Chip variant="suggestion" label="Test"/>
		// 	<Chip variant="suggestion" label="Test" elevated/>
		// 	<Chip variant="suggestion" icon="holiday_village" label="Test"/>
		// 	<Chip variant="suggestion" icon="holiday_village" label="Test" elevated/>
		// 	<br/>
		// 	<br/>
		// 	<form>
		// 		<TextField label="Label" minLength={10} required suffix="@gmail.com" leadingIcon="search"/>
		// 		<TextField prefix="test" label="Label" minLength={3} maxLength={30} counter={false} required clearable/><br/><br/>
		// 		<NumberField label="Number" hugeStep={10} max={100} required /* trailingIcon={<Icon name="search"/>} *//><br/><br/>
		// 		<NumberField shape="filled" label="Number" required trailingIcon="search"/><br/><br/>
		// 		<TextField shape="filled" label="Label" minLength={3} maxLength={30} counter={false} required/><br/><br/>
		// 		<Button selectable label="SWAP" icon="swap_horiz" type="button" selected={swap} onClick={() => setSwap(swap => !swap)}/>
		// 		<Select
		// 			// shape="filled"
		// 			label="Test"
		// 			value={value}
		// 			// searchable
		// 			multiple
		// 			clearable
		// 			onValueChange={value => {console.log("VALUE CHANGED", value); setValue(value)}}
		// 			// searchable
		// 			required
		// 		>
		// 			<Option value="test1"/>
		// 			<Option value="test2" label={!swap ? "Test 2" : "Swapped Test 2"}/>
		// 			<Option value="test3"/>
		// 			<Option value="test4"/>
		// 			<Option value="test5"/>
		// 		</Select>
		// 			<br/><br/>
		// 		<button type="submit">Envoyer</button>
		// 	</form>

		// 	<Slider stopIndicator/>
		// 	<Slider stopIndicator size="small"/>
		// 	<Slider stopIndicator size="medium"/>
		// 	<Slider stopIndicator size="large"/>
		// 	<Slider stopIndicator size="extra-large"/>
		// 	<Dialog
		// 		fullscreen
		// 		buttonLabel="Enregistrer"
		// 		// size="medium"
		// 		// icon="restart_alt"
		// 		headline="Reset settings?"
		// 		// supportingText="This will reset your app preferences back to their default settings. The following accounts will also be signed out:"
		// 		open={open2}
		// 		onClose={() => setOpen2(false)}
		// 	>
		// 		<Content>
		// 			Test
		// 			<div style={{height: 1300, width: 150, backgroundColor: "red"}}/>
		// 			<TextField label="Label" minLength={10} required/>
		// 		</Content>
		// 		<DialogActions>
		// 			<Button label="Annuler" onClick={() => setOpen(false)}/>
		// 			<Button label="Open sub dialog" onClick={() => setOpen2(true)}/>
		// 		</DialogActions>
		// 	</Dialog>
		// 	<Dialog headline="Test" supportingText="Other dialog" open={open} onClose={() => {setOpen(false)}}>
		// 		<Content>
		// 			Test
		// 			<div style={{height: 1300, width: 150, backgroundColor: "red"}}/>
		// 		</Content>
		// 		<DialogActions>
		// 			<Button label="Open sub dialog 2" onClick={() => {setOpen2(true)}}/>
		// 			<Button label="Close sub dialog" onClick={() => {setOpen(false)}}/>
		// 		</DialogActions>
		// 	</Dialog>
		// </>
	)
}
