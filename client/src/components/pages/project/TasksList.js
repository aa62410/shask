import React, { Component } from 'react';
import $ from 'jquery';
import StarRating from '../StarRating';
import EditTaskModal from './EditTaskModal';

class TasksList extends Component {
    constructor(props) {
        super(props);
        this.state = {};
        this.getTasksDiv = this.getTasksDiv.bind(this);
        this.validEditTask = this.validEditTask.bind(this);
        this.taskRow = this.taskRow.bind(this);
        this.getSections = this.getSections.bind(this);
        this.getTasksOfSection = this.getTasksOfSection.bind(this);
    }

    validEditTask(taskInfo) {
        fetch('/api/task/config', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(taskInfo),
        })
            .then(res => res.json())
            .then(data => {
                if (data.status === 'OK') this.props.updateTasksList(taskInfo);
            });
    }

    taskRow(task) {
        let cId = 'taskId' + task.id_task;
        let checkClass =
            task.checked === 1
                ? 'far fa-check-circle col-1'
                : 'far fa-circle col-1';
        return (
            <li
                key={task.id_task}
                className="list-group-item bg-dark text-light"
                style={{ fontSize: '1.1em' }}
            >
                <div className="row d-flex flex-row align-items-center">
                    <i
                        className={checkClass}
                        style={{ cursor: 'pointer', fontSize: '1.3em' }}
                        onClick={() => this.props.fallback(task.id_task)}
                    />
                    <p
                        className="col-lg-6 col-10 text-truncate m-0"
                        id={cId}
                        style={{ cursor: 'pointer' }}
                        onClick={() => {
                            $('#' + cId).toggleClass('text-truncate');
                        }}
                    >
                        {task.description}
                    </p>
                    <div className="col-lg-3 col-12">
                        <div className="d-flex flex-row flex-lg-column justify-content-between justify-content-sm-start">
                            <StarRating
                                default={task.priority}
                                color="yellow"
                                nbStar={5}
                                editable={false}
                                id={(() =>
                                    'starRatingPriority' + task.id_task)()}
                                title="Priorité"
                            />
                            <StarRating
                                className="ml-sm-5 ml-lg-0"
                                default={task.difficulty}
                                color="red"
                                nbStar={5}
                                editable={false}
                                id={(() => 'starRatingDif' + task.id_task)()}
                                title="Difficulté"
                            />
                        </div>
                    </div>
                    <div className="col btn-group">
                        <button
                            data-toggle="modal"
                            data-target="#editTaskModal"
                            className="btn btn-sm btn-light"
                            onClick={() => {
                                this.setState({
                                    defaultEditModal: task,
                                });
                            }}
                        >
                            <i className="far fa-edit" />
                        </button>
                        <button
                            className="btn btn-sm btn-danger"
                            onClick={() => {
                                let conf = window.confirm(
                                    'Voulez vous vraiment supprimer la tâche?'
                                );
                                if (conf) this.props.removeTask(task.id_task);
                            }}
                        >
                            <i className="fas fa-times" />
                        </button>
                    </div>
                </div>
            </li>
        );
    }

    getSections(list) {
        let res = [];
        for (let task of list) {
            if (task.section && res.indexOf(task.section) === -1)
                res.push(task.section);
        }
        res = res.sort();
        res.unshift(null);
        return res;
    }

    getTasksOfSection(section, list) {
        let res = [];
        for (let task of list) {
            if (task.section === section) res.push(task);
        }
        res = res.sort((a, b) => b.priority - a.priority);
        return res;
    }

    getTasksDiv(list) {
        let res = [];
        if (list) {
            let sections = this.getSections(list);
            for (let i = 0; i < sections.length; i++) {
                let section = sections[i];
                let tasks = this.getTasksOfSection(section, list);
                let cId = 'sectionId' + i;
                if (section)
                    res.push(
                        <div>
                            <li
                                className="list-group-item list-group-item-action bg-secondary d-flex justify-content-center align-items-center text-light"
                                style={{ cursor: 'pointer' }}
                            >
                                <h4
                                    data-toggle="collapse"
                                    data-target={(() => '#' + cId)()}
                                >
                                    {section}
                                </h4>
                                <button
                                    className="btn btn-light btn-sm ml-3 rounded-circle"
                                    onClick={() => {
                                        let res = window.prompt(
                                            'Nouveau titre de section',
                                            section
                                        );
                                        if (res) {
                                            let tasksList = this.props.list;
                                            tasksList.forEach(task => {
                                                if (task.section === section) {
                                                    task.section = res;
                                                    fetch('/api/task/config', {
                                                        method: 'POST',
                                                        headers: {
                                                            'Content-Type':
                                                                'application/json',
                                                        },
                                                        body: JSON.stringify(
                                                            task
                                                        ),
                                                    })
                                                        .then(res => res.json())
                                                        .then(data => {
                                                            if (
                                                                data.status ===
                                                                'OK'
                                                            )
                                                                this.props.updateTasksList(
                                                                    task
                                                                );
                                                        });
                                                }
                                            });
                                        }
                                    }}
                                >
                                    <i className="fas fa-cog" />
                                </button>
                            </li>
                            <div className="collapse show" id={cId}>
                                {tasks.map(task => this.taskRow(task))}
                            </div>
                        </div>
                    );
                else res.push(tasks.map(task => this.taskRow(task)));
            }
        }
        return res;
    }

    render() {
        return (
            <div id="tasks-list" className="col-12">
                <EditTaskModal
                    fallback={this.validEditTask}
                    default={
                        this.state.defaultEditModal
                            ? this.state.defaultEditModal
                            : {}
                    }
                />
                <h2>Tâches:</h2>
                <ul className="col-12 list-group list-group-flush bg-dark text-light">
                    {this.getTasksDiv(this.props.list)}
                </ul>
            </div>
        );
    }
}

export default TasksList;
