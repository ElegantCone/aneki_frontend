import {formatDistanceToNow} from 'date-fns'
import {ru} from 'date-fns/locale'

export default function JokeCard({joke, currentUserId, onEdit, onDelete}) {
    const isOwner = currentUserId === joke.userId
    const relativeTime = formatDistanceToNow(new Date(joke.createdAt), {
        addSuffix: true,
        locale: ru,
    })

    return (
        <article className="joke-card">
            <div className="joke-card__header">
                <div>
                    <div className="joke-card__author">{joke.username}</div>
                    <div className="joke-card__time">{relativeTime}</div>
                </div>

                {isOwner && onEdit && onDelete ? (
                    <div className="joke-card__actions">
                        <button className="btn btn-secondary btn-small" type="button" onClick={() => onEdit(joke)}>
                            Редактировать
                        </button>
                        <button className="btn btn-danger btn-small" type="button" onClick={() => onDelete(joke.id)}>
                            Удалить
                        </button>
                    </div>
                ) : null}
            </div>

            <p className="joke-card__body">{joke.content}</p>
        </article>
    )
}
