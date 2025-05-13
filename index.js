function createElement(tag, attributes, children, callbacks = {}) {
    const element = document.createElement(tag);

    if (attributes) {
        Object.keys(attributes).forEach((key) => {
            element.setAttribute(key, attributes[key]);
        });
    }

    if (callbacks) {
        Object.keys(callbacks).forEach((eventName) => {
            element.addEventListener(eventName, callbacks[eventName]);
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
        this._completed = false;
    }

    get name() {
        return this._name;
    }

    get completed() {
        return this._completed;
    }

    toggleCompleted() {
        this._completed = !this._completed;
    }
}

class TodoList extends Component {
    constructor() {
        super();
        this.state = {
            tasks: [
                new TodoItem("Сделать домашку"),
                new TodoItem("Сделать практику"),
                new TodoItem("Пойти домой"),
            ],
            newTaskInput: ""
        };
    }

    update() {
        const newDomNode = this.render();
        this._domNode.replaceWith(newDomNode);
        this._domNode = newDomNode;
    }

    render() {
        const renderedTasks = this.state.tasks.map((item) => {
            const labelStyle = item.completed ? "color: gray; text-decoration: line-through;" : "";

            return createElement("li", {}, [
                createElement("input",
                    item.completed
                        ? {type: "checkbox", checked: "я люблю маму"}
                        : {type: "checkbox"},
                    null,
                    {
                        change: () => {
                            item.toggleCompleted();
                            this.update();
                        }
                    }),
                createElement("label", {style: labelStyle}, item.name),
                createElement("button", {}, "🗑️",
                    {
                        click: () => this.onDeleteTask(item.name)
                    })
            ]);
        });

        return createElement("div", {class: "todo-list"}, [
            createElement("h1", {}, "TODO List"),
            createElement("div", {class: "add-todo"}, [
                createElement("input", {
                    id: "new-todo",
                    type: "text",
                    placeholder: "Задание",
                    value: this.state.newTaskInput
                }, null, {
                    input: this.onAddInputChange.bind(this)
                }),
                createElement("button", {id: "add-btn"}, "+", {
                    click: this.onAddTask.bind(this)
                }),
            ]),
            createElement("ul", {id: "todos"}, renderedTasks),
        ]);
    }

    onDeleteTask(taskToDeleteName) {
        this.state = {
            ...this.state,
            tasks: this.state.tasks.filter(task => task.name !== taskToDeleteName),
        };
        this.update()
    }

    onAddTask() {
        if (this.state.newTaskInput.trim() === "")
            return;

        const newTask = new TodoItem(this.state.newTaskInput);
        this.state = {
            ...this.state,
            tasks: [...this.state.tasks, newTask],
            newTaskInput: ""
        };
        this.update();
    }

    onAddInputChange(event) {
        this.state = {
            ...this.state,
            newTaskInput: event.target.value
        };
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const todoList = new TodoList();
    const domNode = todoList.getDomNode();
    document.body.appendChild(domNode);
});