from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.database import get_db
from app.deps import get_current_user
from app.models import Task, TaskPriority, TaskStatus, User
from app.schemas import TaskCreate, TaskList, TaskOut, TaskSort, TaskUpdate

router = APIRouter(prefix="/tasks", tags=["tasks"])


def get_own_task(task_id: int, db: Session, user: User) -> Task:
    """Знаходить задачу й перевіряє, що вона належить поточному користувачу."""
    task = db.get(Task, task_id)
    if task is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Задачу не знайдено"
        )
    if task.owner_id != user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Ця задача належить іншому користувачу",
        )
    return task


@router.post("", response_model=TaskOut, status_code=status.HTTP_201_CREATED)
def create_task(
    data: TaskCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    task = Task(**data.model_dump(), owner_id=current_user.id)
    db.add(task)
    db.commit()
    db.refresh(task)
    return task


@router.get("", response_model=TaskList)
def list_tasks(
    status_filter: TaskStatus | None = Query(None, alias="status"),
    priority: TaskPriority | None = None,
    q: str | None = Query(None, max_length=100, description="Пошук за назвою"),
    sort: TaskSort = TaskSort.created_desc,
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    conditions = [Task.owner_id == current_user.id]
    if status_filter:
        conditions.append(Task.status == status_filter)
    if priority:
        conditions.append(Task.priority == priority)
    if q and q.strip():
        # екрануємо % і _, щоб їх не сприймали як шаблон
        escaped = (
            q.strip().replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_")
        )
        conditions.append(Task.title.ilike(f"%{escaped}%", escape="\\"))

    if sort == TaskSort.due_asc:
        order = [Task.due_date.asc().nulls_last()]
    elif sort == TaskSort.due_desc:
        order = [Task.due_date.desc().nulls_last()]
    elif sort == TaskSort.created_asc:
        order = [Task.created_at.asc()]
    else:
        order = [Task.created_at.desc()]
    # id в кінці, щоб порядок був стабільним між сторінками
    order.append(Task.id.desc())

    total = db.scalar(select(func.count()).select_from(Task).where(*conditions))
    items = db.scalars(
        select(Task).where(*conditions).order_by(*order).limit(limit).offset(offset)
    ).all()

    return TaskList(items=items, total=total or 0, limit=limit, offset=offset)


@router.get("/{task_id}", response_model=TaskOut)
def get_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_own_task(task_id, db, current_user)


@router.patch("/{task_id}", response_model=TaskOut)
def update_task(
    task_id: int,
    data: TaskUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    task = get_own_task(task_id, db, current_user)

    changes = data.model_dump(exclude_unset=True)
    if not changes:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Не передано жодного поля для оновлення",
        )

    for field, value in changes.items():
        setattr(task, field, value)
    db.commit()
    db.refresh(task)
    return task


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    task = get_own_task(task_id, db, current_user)
    db.delete(task)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
