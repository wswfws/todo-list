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

class Task extends Component {
    constructor(item, onDelete, onToggle) {
        super();
        this.item = item;
        this.onDelete = onDelete;
        this.onToggle = onToggle;
        this.confirmDelete = false;
        //this._requestUpdate = onRequestUpdate;
    }

    handleDeleteClick(event) {
        if (!this.confirmDelete) {
            this.confirmDelete = true;
            event.target.style.background = "red";
            //this._requestUpdate();
            return;
        }
        this.onDelete(this.item.name);
    }

    render() {
        const labelStyle = this.item.completed ? "color: gray; text-decoration: line-through;" : "";
        const deleteBtnAttrs = this.confirmDelete
            ? { style: "background: red;" }
            : {};

        return createElement("li", {}, [
            createElement("input",
                { type: "checkbox", ...(this.item.completed && { checked: true }) },
                null,
                { change: () => { this.onToggle(this.item); } }
            ),
            createElement("label", { style: labelStyle }, this.item.name),
            createElement("button", deleteBtnAttrs, "🗑️", {
                click: (e) => this.handleDeleteClick(e)
            })
        ]);
    }
}

class AddTask extends Component {
    constructor(inputValue, onInputChange, onAddTask) {
        super();
        this.inputValue = inputValue;
        this.onInputChange = onInputChange;
        this.onAddTask = onAddTask;
    }

    render() {
        return createElement("div", {class: "add-todo"}, [
            createElement("input", {
                id: "new-todo",
                type: "text",
                placeholder: "Задание",
                value: this.inputValue
            }, null, {
                input: this.onInputChange
            }),
            createElement("button", {id: "add-btn"}, "+", {
                click: this.onAddTask
            }),
        ]);
    }
}

class TodoList extends Component {
    constructor() {
        super();
        const savedState = localStorage.getItem('todoListState');
        this.state = savedState
            ? this.parseSavedState(JSON.parse(savedState))
            : {
                tasks: [
                    new TodoItem("Сделать домашку"),
                    new TodoItem("Сделать практику"),
                    new TodoItem("Пойти домой"),
                ],
                newTaskInput: ""
            };
        this.taskComponents = new Map();
    }

    parseSavedState(savedState) {
        return {
            ...savedState,
            tasks: savedState.tasks.map(item => {
                const todoItem = new TodoItem(item._name);
                todoItem._completed = item._completed;
                return todoItem;
            })
        };
    }

    saveState() {
        localStorage.setItem('todoListState', JSON.stringify(this.state));
    }

    update() {
        this.saveState();
        const newDomNode = this.render();
        this._domNode.replaceWith(newDomNode);
        this._domNode = newDomNode;
    }

    render() {
        const renderedTasks = this.state.tasks.map((item) => {
            let taskComp = this.taskComponents.get(item.name);
            if (!taskComp) {
                taskComp = new Task(
                    item,
                    name => this.onDeleteTask(name),
                    task => {
                        task.toggleCompleted();
                        this.update();
                    }
                );
                this.taskComponents.set(item.name, taskComp);
            } else {
                taskComp.item = item;
            }
            return taskComp.getDomNode();
        });

        const currentNames = new Set(this.state.tasks.map(t => t.name));
        for (let name of this.taskComponents.keys()) {
            if (!currentNames.has(name)) {
                this.taskComponents.delete(name);
            }
        }

        return createElement("div", {class: "todo-list"}, [
            createElement("h1", {}, "TODO List"),
            new AddTask(
                this.state.newTaskInput,
                (event) => this.onAddInputChange(event),
                () => this.onAddTask()
            ).getDomNode(),
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