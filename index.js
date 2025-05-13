function createElement(tag, attributes, children) {
    const element = document.createElement(tag);

    if (attributes) {
        Object.keys(attributes).forEach((key) => {
            element.setAttribute(key, attributes[key]);
        });
    }

    if (Array.isArray(children)) {
        children.forEach((child) => {
            if (typeof child === "string") {
                element.appendChild(document.createTextNode(child));
            } else if (child instanceof HTMLElement) {
                element.appendChild(child);
            }
        });
    } else if (typeof children === "string") {
        element.appendChild(document.createTextNode(children));
    } else if (children instanceof HTMLElement) {
        element.appendChild(children);
    }

    return element;
}

class Component {
    constructor() {
    }

    getDomNode() {
        this._domNode = this.render();
        return this._domNode;
    }
}

class TodoItem {
    constructor(name) {
        this._name = name;
    }

    get name() {
        return this._name;
    }

}

class TodoList extends Component {

    constructor() {
        super();
        this.state = {
            tasks: [
                new TodoItem(name = "Сделать домашку"),
                new TodoItem(name = "Сделать практику"),
                new TodoItem(name = "Пойти домой"),
            ]
        };
    }

    render() {

        const renderedTasks = this.state.tasks.map((item) => {
            return createElement("li", {}, [
                createElement("input", {type: "checkbox"}),
                createElement("label", {}, item.name),
                createElement("button", {}, "🗑️")
            ])
        })

        return createElement("div", {class: "todo-list"}, [
            createElement("h1", {}, "TODO List"),
            createElement("div", {class: "add-todo"}, [
                createElement("input", {
                    id: "new-todo",
                    type: "text",
                    placeholder: "Задание",
                }),
                createElement("button", {id: "add-btn"}, "+"),
            ]),
            createElement("ul", {id: "todos"}, renderedTasks),
        ]);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    document.body.appendChild(new TodoList().getDomNode());
});
