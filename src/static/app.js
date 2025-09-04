document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message
      activitiesList.innerHTML = "";

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft = details.max_participants - details.participants.length;

        // Participants section
        let participantsSection = "";
        if (details.participants.length > 0) {
          participantsSection = `
            <section class="participants-section">
              <strong>Participants:</strong>
              <ul class="participants-list">
                ${details.participants.map(p => `
                  <li class="participant-item">
                    <span class="participant-email">${p}</span>
                    <span class="delete-participant" title="Remove participant" data-activity="${name}" data-email="${p}">
                      <svg xmlns="https://www.w3.org/TR/SVG2/" viewBox="0 0 24 24" width="24" height="24" stroke="#c62828" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
                        <line x1="10" y1="11" x2="10" y2="17" />
                        <line x1="14" y1="11" x2="14" y2="17" />
                      </svg>
                    </span>
                  </li>
                `).join("")}
              </ul>
            </section>
          `;
        } else {
          participantsSection = `
            <section class="participants-section empty">
              <strong>Participants:</strong> <span>No one has signed up yet.</span>
            </section>
          `;
        }

        activityCard.innerHTML = `
          <h4 class="activity-title">${name}</h4>
          <p>${details.description}</p>
          <p><strong>Schedule:</strong> ${details.schedule}</p>
          <p><strong>Availability:</strong> ${spotsLeft} spots left</p>
          ${participantsSection}
        `;

        activitiesList.appendChild(activityCard);

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });

      // Add event listeners for delete icons
      document.querySelectorAll('.delete-participant').forEach(icon => {
        icon.addEventListener('click', async (e) => {
          const activity = e.target.getAttribute('data-activity');
          const email = e.target.getAttribute('data-email');
          if (confirm(`Remove ${email} from ${activity}?`)) {
            try {
              const response = await fetch(`/activities/${encodeURIComponent(activity)}/unregister?email=${encodeURIComponent(email)}`, {
                method: 'DELETE',
              });
              const result = await response.json();
              if (response.ok) {
                messageDiv.textContent = result.message || 'Participant removed.';
                messageDiv.className = 'success';
                fetchActivities();
              } else {
                messageDiv.textContent = result.detail || 'Failed to remove participant.';
                messageDiv.className = 'error';
              }
              messageDiv.classList.remove('hidden');
              setTimeout(() => messageDiv.classList.add('hidden'), 5000);
            } catch (error) {
              messageDiv.textContent = 'Error removing participant.';
              messageDiv.className = 'error';
              messageDiv.classList.remove('hidden');
            }
          }
        });
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        signupForm.reset();
        // Refresh activities list so UI updates immediately
        fetchActivities();
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
    console.error("Error signing up:", error);
  }
});

  // Initialize app
  fetchActivities();
});
