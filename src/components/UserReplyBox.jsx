function UserReplyBox({ value, onChange, onSubmit, disabled }) {
  return (
    <form className="user-reply-box" onSubmit={onSubmit}>
      <label className="reply-label" htmlFor="user-reply">
        Your response
      </label>

      <input
        id="user-reply"
        className="reply-input"
        type="text"
        value={value}
        onChange={onChange}
        placeholder="Type your response..."
        disabled={disabled}
      />

      <button className="reply-button" type="submit" disabled={disabled}>
        {disabled ? 'Thinking...' : 'Send'}
      </button>
    </form>
  )
}

export default UserReplyBox