def create_task(client, headers, **overrides):
    payload = {"title": "Написати звіт"}
    payload.update(overrides)
    response = client.post("/tasks", json=payload, headers=headers)
    assert response.status_code == 201, response.text
    return response.json()


# ---------- Створення ----------


def test_create_task_with_defaults(client, auth_headers):
    task = create_task(client, auth_headers)
    assert task["title"] == "Написати звіт"
    assert task["status"] == "todo"
    assert task["priority"] == "medium"
    assert task["description"] is None
    assert task["due_date"] is None
    assert task["created_at"] and task["updated_at"]


def test_create_task_with_all_fields(client, auth_headers):
    task = create_task(
        client,
        auth_headers,
        description="Квартальний",
        status="in_progress",
        priority="high",
        due_date="2026-12-01T12:00:00Z",
    )
    assert task["description"] == "Квартальний"
    assert task["status"] == "in_progress"
    assert task["priority"] == "high"
    assert task["due_date"].startswith("2026-12-01")


def test_create_task_empty_title(client, auth_headers):
    response = client.post("/tasks", json={"title": "   "}, headers=auth_headers)
    assert response.status_code == 422


def test_create_task_invalid_status(client, auth_headers):
    response = client.post(
        "/tasks", json={"title": "Тест", "status": "finished"}, headers=auth_headers
    )
    assert response.status_code == 422


def test_tasks_require_token(client):
    assert client.get("/tasks").status_code == 401
    assert client.post("/tasks", json={"title": "x"}).status_code == 401


# ---------- Читання, оновлення, видалення ----------


def test_get_task(client, auth_headers):
    created = create_task(client, auth_headers)
    response = client.get(f"/tasks/{created['id']}", headers=auth_headers)
    assert response.status_code == 200
    assert response.json()["id"] == created["id"]


def test_get_missing_task(client, auth_headers):
    response = client.get("/tasks/999", headers=auth_headers)
    assert response.status_code == 404


def test_update_task_partially(client, auth_headers):
    created = create_task(client, auth_headers, priority="low")
    response = client.patch(
        f"/tasks/{created['id']}", json={"status": "done"}, headers=auth_headers
    )
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "done"
    # інші поля не зачеплені
    assert data["title"] == created["title"]
    assert data["priority"] == "low"


def test_update_can_clear_description_and_due_date(client, auth_headers):
    created = create_task(
        client, auth_headers, description="Текст", due_date="2026-12-01T12:00:00Z"
    )
    response = client.patch(
        f"/tasks/{created['id']}",
        json={"description": None, "due_date": None},
        headers=auth_headers,
    )
    assert response.status_code == 200
    assert response.json()["description"] is None
    assert response.json()["due_date"] is None


def test_update_with_empty_body(client, auth_headers):
    created = create_task(client, auth_headers)
    response = client.patch(f"/tasks/{created['id']}", json={}, headers=auth_headers)
    assert response.status_code == 400


def test_update_title_to_null_is_rejected(client, auth_headers):
    created = create_task(client, auth_headers)
    response = client.patch(
        f"/tasks/{created['id']}", json={"title": None}, headers=auth_headers
    )
    assert response.status_code == 422


def test_delete_task(client, auth_headers):
    created = create_task(client, auth_headers)
    response = client.delete(f"/tasks/{created['id']}", headers=auth_headers)
    assert response.status_code == 204
    assert client.get(f"/tasks/{created['id']}", headers=auth_headers).status_code == 404


# ---------- Чужі задачі ----------


def test_list_shows_only_own_tasks(client, auth_headers, other_headers):
    create_task(client, auth_headers, title="Моя")
    create_task(client, other_headers, title="Чужа")

    response = client.get("/tasks", headers=auth_headers)
    titles = [t["title"] for t in response.json()["items"]]
    assert titles == ["Моя"]
    assert response.json()["total"] == 1


def test_cannot_read_foreign_task(client, auth_headers, other_headers):
    foreign = create_task(client, other_headers)
    response = client.get(f"/tasks/{foreign['id']}", headers=auth_headers)
    assert response.status_code == 403


def test_cannot_update_foreign_task(client, auth_headers, other_headers):
    foreign = create_task(client, other_headers)
    response = client.patch(
        f"/tasks/{foreign['id']}", json={"title": "Злам"}, headers=auth_headers
    )
    assert response.status_code == 403
    # а в автора нічого не змінилося
    original = client.get(f"/tasks/{foreign['id']}", headers=other_headers).json()
    assert original["title"] == foreign["title"]


def test_cannot_delete_foreign_task(client, auth_headers, other_headers):
    foreign = create_task(client, other_headers)
    response = client.delete(f"/tasks/{foreign['id']}", headers=auth_headers)
    assert response.status_code == 403
    assert client.get(f"/tasks/{foreign['id']}", headers=other_headers).status_code == 200


# ---------- Фільтри, пошук, сортування ----------


def test_filter_by_status(client, auth_headers):
    create_task(client, auth_headers, title="A", status="todo")
    create_task(client, auth_headers, title="B", status="done")

    response = client.get("/tasks?status=done", headers=auth_headers)
    assert [t["title"] for t in response.json()["items"]] == ["B"]


def test_filter_by_priority(client, auth_headers):
    create_task(client, auth_headers, title="A", priority="low")
    create_task(client, auth_headers, title="B", priority="high")

    response = client.get("/tasks?priority=high", headers=auth_headers)
    assert [t["title"] for t in response.json()["items"]] == ["B"]


def test_combined_filters(client, auth_headers):
    create_task(client, auth_headers, title="A", status="todo", priority="high")
    create_task(client, auth_headers, title="B", status="done", priority="high")
    create_task(client, auth_headers, title="C", status="todo", priority="low")

    response = client.get("/tasks?status=todo&priority=high", headers=auth_headers)
    assert [t["title"] for t in response.json()["items"]] == ["A"]


def test_invalid_filter_value(client, auth_headers):
    response = client.get("/tasks?status=unknown", headers=auth_headers)
    assert response.status_code == 422


def test_search_by_title_ignores_case(client, auth_headers):
    create_task(client, auth_headers, title="Weekly Report")
    create_task(client, auth_headers, title="Buy milk")

    response = client.get("/tasks?q=report", headers=auth_headers)
    assert [t["title"] for t in response.json()["items"]] == ["Weekly Report"]


def test_search_treats_percent_literally(client, auth_headers):
    create_task(client, auth_headers, title="Знижка 50% на каву")
    create_task(client, auth_headers, title="Звичайна задача")

    response = client.get("/tasks?q=%", headers=auth_headers)
    assert [t["title"] for t in response.json()["items"]] == ["Знижка 50% на каву"]


def test_sort_by_due_date(client, auth_headers):
    create_task(client, auth_headers, title="Пізно", due_date="2026-12-20T10:00:00Z")
    create_task(client, auth_headers, title="Без дедлайну")
    create_task(client, auth_headers, title="Рано", due_date="2026-11-15T10:00:00Z")

    asc = client.get("/tasks?sort=due_date", headers=auth_headers).json()["items"]
    # задачі без дедлайну завжди в кінці
    assert [t["title"] for t in asc] == ["Рано", "Пізно", "Без дедлайну"]

    desc = client.get("/tasks?sort=-due_date", headers=auth_headers).json()["items"]
    assert [t["title"] for t in desc] == ["Пізно", "Рано", "Без дедлайну"]


# ---------- Пагінація ----------


def test_pagination(client, auth_headers):
    for i in range(5):
        create_task(client, auth_headers, title=f"Задача {i}")

    first = client.get("/tasks?limit=2&offset=0", headers=auth_headers).json()
    assert first["total"] == 5
    assert first["limit"] == 2
    assert first["offset"] == 0
    assert len(first["items"]) == 2

    last = client.get("/tasks?limit=2&offset=4", headers=auth_headers).json()
    assert len(last["items"]) == 1

    # сторінки не перетинаються
    second = client.get("/tasks?limit=2&offset=2", headers=auth_headers).json()
    ids = [t["id"] for t in first["items"] + second["items"] + last["items"]]
    assert len(set(ids)) == 5


def test_pagination_limits_are_validated(client, auth_headers):
    assert client.get("/tasks?limit=0", headers=auth_headers).status_code == 422
    assert client.get("/tasks?limit=1000", headers=auth_headers).status_code == 422
    assert client.get("/tasks?offset=-1", headers=auth_headers).status_code == 422
