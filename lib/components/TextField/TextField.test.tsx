import {act, type ReactNode} from "react";
import {createRoot, type Root} from "react-dom/client";
import {afterEach, beforeEach, describe, expect, it, vi} from "vitest";
import OrderedCollection, {type OrderedCollectionChildData} from "../../misc/OrderedCollection";
import Theme from "../Theme";
import TextField, {type TextFieldProps} from "./index";

const roots: Root[] = [];
const rootsByContainer = new WeakMap<HTMLElement, Root>();

function render(element: ReactNode)
{
	const container = document.createElement("div");
	const root = createRoot(container);

	document.body.append(container);
	roots.push(root);
	rootsByContainer.set(container, root);
	act(() => root.render(element));
	return (container);
}

function rerender(container: HTMLElement, element: ReactNode)
{
	const root = rootsByContainer.get(container);

	if (!root)
		throw new Error("Cannot rerender an unmounted container");
	act(() => root.render(element));
}

function changeInput(input: HTMLInputElement, value: string)
{
	const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set;

	if (!setter)
		throw new Error("HTMLInputElement.value setter is unavailable");
	act(() =>
	{
		setter.call(input, value);
		input.dispatchEvent(new Event("input", {bubbles: true}));
	});
}

describe("TextField label", () =>
{
	beforeEach(() =>
	{
		vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
	});

	afterEach(() =>
	{
		for (const root of roots.splice(0))
			act(() => root.unmount());
		document.body.replaceChildren();
		vi.unstubAllGlobals();
	});

	it.each(["outlined", "filled"] as const)("keeps the default %s label inside the field", shape =>
	{
		const container = render(<TextField shape={shape} label="Name"/>);
		const label = container.querySelector(".Field .label")!;
		const input = container.querySelector("input")!;

		expect(label.textContent).toBe("Name");
		expect(input.id).not.toBe("");
		expect(container.querySelector("label")).toBeNull();
	});

	it("renders an associated label above the field and focuses the input when clicked", () =>
	{
		const container = render(<TextField id="name-input" label="Name" labelPosition="above"/>);
		const label = container.querySelector("label.label.above") as HTMLLabelElement;
		const input = container.querySelector("input")!;

		expect(label.htmlFor).toBe("name-input");
		expect(input.id).toBe("name-input");
		expect(container.querySelector(".Field .label")).toBeNull();

		act(() => label.click());
		expect(document.activeElement).toBe(input);
	});

	it.each(["inline", "above"] as const)("renders a %s label outside the field", labelPosition =>
	{
		const container = render(<TextField label="Email" labelPosition={labelPosition}/>);
		const label = container.querySelector("label")!;

		expect(label.classList.contains(labelPosition)).toBe(true);
		expect(label.htmlFor).toBe(container.querySelector("input")?.id);
	});

	it("adds an asterisk to the label when the field is required", () =>
	{
		const container = render(<TextField label="Email" required/>);
		const labels = Array.from(container.querySelectorAll(".Field .label"));

		expect(labels.length).toBeGreaterThan(0);
		expect(labels.every(label => label.textContent === "Email*")).toBe(true);
	});
});

describe("TextField input", () =>
{
	beforeEach(() =>
	{
		vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
	});

	afterEach(() =>
	{
		for (const root of roots.splice(0))
			act(() => root.unmount());
		document.body.replaceChildren();
		vi.unstubAllGlobals();
	});

	it("forwards native input attributes and renders its initial value", () =>
	{
		const container = render(
			<TextField
				id="email"
				type="email"
				defaultValue="user@example.com"
				placeholder="name@example.com"
				disabled
				autoComplete="email"
				aria-label="Email address"
			/>
		);
		const input = container.querySelector("input")!;

		expect(input.id).toBe("email");
		expect(input.type).toBe("email");
		expect(input.value).toBe("user@example.com");
		expect(input.placeholder).toBe("name@example.com");
		expect(input.disabled).toBe(true);
		expect(input.autocomplete).toBe("email");
		expect(input.getAttribute("aria-label")).toBe("Email address");
	});

	it("updates an uncontrolled value and calls both change callbacks", () =>
	{
		const onChange = vi.fn();
		const onValueChange = vi.fn();
		const container = render(<TextField defaultValue="before" onChange={onChange} onValueChange={onValueChange}/>);
		const input = container.querySelector("input")!;

		changeInput(input, "after");

		expect(input.value).toBe("after");
		expect(onChange).toHaveBeenCalledOnce();
		expect(onValueChange).toHaveBeenCalledWith("after");
	});

	it("leaves a controlled value to its owner and reflects subsequent prop updates", () =>
	{
		const onValueChange = vi.fn();
		const container = render(<TextField value="initial" onValueChange={onValueChange}/>);
		const input = container.querySelector("input")!;

		changeInput(input, "edited");

		expect(input.value).toBe("initial");
		expect(onValueChange).toHaveBeenCalledWith("edited");

		rerender(container, <TextField value="updated" onValueChange={onValueChange}/>);
		expect(input.value).toBe("updated");
	});

	it("supports a controlled empty value instead of falling back to defaultValue", () =>
	{
		const container = render(<TextField value="" defaultValue="fallback"/>);

		expect(container.querySelector("input")?.value).toBe("");
	});

	it("applies focus state to the field and removes it on blur", () =>
	{
		const container = render(<TextField/>);
		const input = container.querySelector("input")!;
		const field = container.querySelector(".Field")!;

		act(() => input.focus());
		expect(field.classList.contains("focus")).toBe(true);

		act(() => input.blur());
		expect(field.classList.contains("focus")).toBe(false);
	});
});

describe("TextField in OrderedCollection", () =>
{
	beforeEach(() =>
	{
		vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
	});

	afterEach(() =>
	{
		for (const root of roots.splice(0))
			act(() => root.unmount());
		document.body.replaceChildren();
		vi.unstubAllGlobals();
	});

	it("registers multiple fields and their props instead of rendering inputs", () =>
	{
		const childrenUpdates: OrderedCollectionChildData<TextFieldProps>[][] = [];
		const onChildrenChange = (children: OrderedCollectionChildData<TextFieldProps>[]) => childrenUpdates.push(children);
		const container = render(
			<OrderedCollection<TextFieldProps> name="FormFields" childName="TextField" onChildrenChange={onChildrenChange}>
				<TextField id="email" label="Email" defaultValue="person@example.com"/>
				<TextField id="password" label="Password" type="password"/>
			</OrderedCollection>
		);

		expect(container.querySelector("input")).toBeNull();
		expect(container.querySelectorAll(".OrderedCollectionChild")).toHaveLength(2);
		expect(Array.from(container.querySelectorAll(".OrderedCollectionChild")).every(child => child.getAttribute("data-name") === "TextField")).toBe(true);
		expect(childrenUpdates.at(-1)).toEqual([
			expect.objectContaining({
				id: "email",
				orderedCollectionName: "TextField",
				label: "Email",
				defaultValue: "person@example.com"
			}),
			expect.objectContaining({
				id: "password",
				orderedCollectionName: "TextField",
				label: "Password",
				type: "password"
			})
		]);
	});
});

describe("TextField counters", () =>
{
	beforeEach(() =>
	{
		vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
	});

	afterEach(() =>
	{
		for (const root of roots.splice(0))
			act(() => root.unmount());
		document.body.replaceChildren();
		vi.unstubAllGlobals();
	});

	it("counts characters, truncates values at maxLength and updates the counter", () =>
	{
		const onValueChange = vi.fn();
		const container = render(<TextField maxLength={3} onValueChange={onValueChange}/>);
		const input = container.querySelector("input")!;

		expect(container.querySelector(".counter")?.textContent).toBe("0 / 3");
		expect(input.maxLength).toBe(3);
		changeInput(input, "abcdef");

		expect(input.value).toBe("abc");
		expect(container.querySelector(".counter")?.textContent).toBe("3 / 3");
		expect(onValueChange).toHaveBeenCalledWith("abc");
	});

	it("initializes the counter from a supplied value and hides it when disabled", () =>
	{
		const container = render(<TextField defaultValue="hello" maxLength={8}/>);

		expect(container.querySelector(".counter")?.textContent).toBe("5 / 8");

		const hiddenCounter = render(<TextField defaultValue="hello" maxLength={8} counter={false}/>);
		expect(hiddenCounter.querySelector(".counter")).toBeNull();
	});

	it("counts words and limits the value and counter to maxLength words", () =>
	{
		const onValueChange = vi.fn();
		const container = render(<TextField maxLength={2} counter="word" onValueChange={onValueChange}/>);
		const input = container.querySelector("input")!;

		expect(input.hasAttribute("maxLength")).toBe(false);
		changeInput(input, "one two three");

		expect(input.value).toBe("one two");
		expect(container.querySelector(".counter")?.textContent).toBe("2 / 2");
		expect(onValueChange).toHaveBeenCalledWith("one two");
	});

	it("counts words from the initial value", () =>
	{
		const container = render(<TextField defaultValue="one two" maxLength={4} counter="word"/>);

		expect(container.querySelector(".counter")?.textContent).toBe("2 / 4");
	});
});

describe("TextField adornments and validation", () =>
{
	beforeEach(() =>
	{
		vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
		vi.stubGlobal("matchMedia", vi.fn((media: string) => ({
			matches: false,
			media,
			onchange: null,
			addListener: vi.fn(),
			removeListener: vi.fn(),
			addEventListener: vi.fn(),
			removeEventListener: vi.fn(),
			dispatchEvent: vi.fn()
		})));
		vi.stubGlobal("ResizeObserver", class
		{
			observe = vi.fn();
			unobserve = vi.fn();
			disconnect = vi.fn();
		});
	});

	afterEach(() =>
	{
		for (const root of roots.splice(0))
			act(() => root.unmount());
		document.body.replaceChildren();
		vi.unstubAllGlobals();
	});

	it.each(["filled", "outlined"] as const)("renders prefix and suffix with the %s shape", shape =>
	{
		const container = render(<TextField shape={shape} prefix="$" suffix="USD" label="Amount"/>);

		expect(container.querySelector(".Field")?.classList.contains(shape === "filled" ? "FilledField" : "OutlinedField")).toBe(true);
		expect(container.querySelector("span.prefix")?.textContent).toBe("$");
		expect(container.querySelector("span.suffix")?.textContent).toBe("USD");
		expect(container.querySelector(".Field .label")?.textContent).toBe("Amount");
	});

	it("clears the value and calls onValueChange when the clear button is activated", () =>
	{
		const onValueChange = vi.fn();
		const container = render(
			<Theme primaryColor="#6750A4" colorScheme="light" noDefaultStyle>
				<TextField defaultValue="clear me" clearable onValueChange={onValueChange}/>
			</Theme>
		);
		const input = container.querySelector("input")!;
		const clearButton = container.querySelector<HTMLButtonElement>("button.trailing")!;

		act(() => clearButton.click());

		expect(input.value).toBe("");
		expect(onValueChange).toHaveBeenCalledWith("");
	});

	it("toggles password visibility", () =>
	{
		const container = render(
			<Theme primaryColor="#6750A4" colorScheme="light" noDefaultStyle>
				<TextField type="password"/>
			</Theme>
		);
		const input = container.querySelector("input")!;
		const visibilityButton = container.querySelector<HTMLButtonElement>("button.trailing")!;

		expect(input.type).toBe("password");
		act(() => visibilityButton.click());
		expect(input.type).toBe("text");
		act(() => visibilityButton.click());
		expect(input.type).toBe("password");
	});

	it("shows supporting text, reports invalid input, then clears the error after editing", () =>
	{
		const onInvalid = vi.fn();
		const container = render(<TextField required supportingText="Enter a value" onInvalid={onInvalid}/>);
		const input = container.querySelector("input")!;

		expect(container.querySelector(".message")?.textContent).toBe("Enter a value");
		act(() => input.dispatchEvent(new Event("invalid", {cancelable: true})));

		expect(onInvalid).toHaveBeenCalledOnce();
		expect(container.querySelector(".TextField")?.classList.contains("error")).toBe(true);
		expect(container.querySelector(".message")?.textContent).toBe(input.validationMessage);
		expect(document.activeElement).toBe(input);

		changeInput(input, "valid");
		expect(container.querySelector(".TextField")?.classList.contains("error")).toBe(false);
		expect(container.querySelector(".message")?.textContent).toBe("Enter a value");
	});
});
