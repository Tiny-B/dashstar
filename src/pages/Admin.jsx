// a tertiary dashboard only accessible to admin level users, here tasks can be set and messages sent out

import './CSS/admin.css';

function Admin() {
  return (
    <div className="admin-container">

      <h1 className="admin-title">Admin</h1>

      <div className="admin-grid">

        {/* Create Team */}
        <section className="admin-card">
          <h2 className="admin-card-title">👥 Create Team</h2>

          <div className="admin-form">
            <label>Team Name</label>
            <input type="text" placeholder="Enter team name" />

            <label>Assign Members</label>
            <select>
              <option>Select users...</option>
            </select>

            <button className="btn-primary">Create Team</button>
          </div>
        </section>

        {/* Create Task */}
        <section className="admin-card">
          <h2 className="admin-card-title">➕ Create Task</h2>

          <div className="admin-form">
            <label>Task Title</label>
            <input type="text" placeholder="Enter task title" />

            <label>Description</label>
            <textarea placeholder="Task description..." rows="3"></textarea>

            <label>Assign To</label>
            <select>
              <option>Select team/user...</option>
            </select>

            <label>Deadline</label>
            <input type="date" />

            <button className="btn-primary">Create Task</button>
          </div>
        </section>

        {/* Edit/Delete Task */}
        <section className="admin-card">
          <h2 className="admin-card-title">✏️ Edit/Delete Task</h2>

          <div className="admin-form">
            <label>Select Task</label>
            <select>
              <option>Choose existing task...</option>
            </select>

            <label>Task Title</label>
            <input type="text" defaultValue="Website Redesign" />

            <label>Description</label>
            <textarea defaultValue="Complete redesign of company website" rows="3"></textarea>

            <div className="admin-button-row">
              <button className="btn-primary">Save Changes</button>
              <button className="btn-secondary">Delete Task</button>
            </div>
          </div>
        </section>

        {/* Create Message */}
        <section className="admin-card">
          <h2 className="admin-card-title">✉️ Create Message</h2>

          <div className="admin-form">
            <label>Send To</label>
            <select>
              <option>Select recipient...</option>
            </select>

            <label>Subject</label>
            <input type="text" placeholder="Message subject" />

            <label>Message</label>
            <textarea placeholder="Type your message..." rows="4"></textarea>

            <button className="btn-primary">Send Message</button>
          </div>
        </section>

      </div>
    </div>
  );
}

export default Admin;
