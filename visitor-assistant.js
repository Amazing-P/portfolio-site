(function () {
    const OWNER_EMAIL = "precious.azubuike032@gmail.com";
    const LEAD_ENDPOINT = "https://formspree.io/f/mnjywrqg";

    const toggle = document.querySelector(".assistant-toggle");
    const panel = document.querySelector("#assistant-panel");
    const closeButton = document.querySelector(".assistant-close");
    const messages = document.querySelector("#assistant-messages");
    const form = document.querySelector("#assistant-form");
    const input = document.querySelector("#assistant-input");
    const options = document.querySelector("#assistant-options");

    if (!toggle || !panel || !messages || !form || !input || !options) {
        return;
    }

    const lead = {
        visitorType: "",
        name: "",
        email: "",
        organization: "",
        interest: "",
        timeline: "",
        message: ""
    };

    const steps = [
        {
            key: "visitorType",
            prompt: "Hi, I am Precious's portfolio assistant. What best describes you today?",
            options: ["Recruiter", "Customer", "Employer", "Regular visitor"]
        },
        {
            key: "name",
            prompt: "Great. What is your name?"
        },
        {
            key: "email",
            prompt: "What email should Precious use to reply?"
        },
        {
            key: "organization",
            prompt: "What company, school, or organization are you with? You can write N/A."
        },
        {
            key: "interest",
            prompt: "What are you most interested in?",
            options: ["AI role", "Automation project", "Generative AI", "Computer vision", "Collaboration", "General question"]
        },
        {
            key: "timeline",
            prompt: "What timeline are you working with?",
            options: ["ASAP", "This week", "This month", "Flexible", "Just browsing"]
        },
        {
            key: "message",
            prompt: "Please share the key details Precious should know."
        },
        {
            key: "consent",
            prompt: "Thanks. May I send this information to Precious by email?",
            options: ["Yes, send it", "No, not now"]
        }
    ];

    let currentStep = 0;
    let started = false;

    function addMessage(text, sender) {
        const bubble = document.createElement("div");
        bubble.className = `assistant-message ${sender}`;
        bubble.textContent = text;
        messages.appendChild(bubble);
        messages.scrollTop = messages.scrollHeight;
    }

    function renderOptions(step) {
        options.innerHTML = "";
        if (!step.options) {
            return;
        }

        step.options.forEach((label) => {
            const button = document.createElement("button");
            button.type = "button";
            button.textContent = label;
            button.addEventListener("click", () => handleReply(label));
            options.appendChild(button);
        });
    }

    function askCurrentQuestion() {
        const step = steps[currentStep];
        input.value = "";
        input.placeholder = step.options ? "Choose an option or type here" : "Type your reply";
        renderOptions(step);
        addMessage(step.prompt, "bot");
    }

    function classifyLead() {
        const type = lead.visitorType.toLowerCase();
        if (type.includes("recruiter")) {
            return "Recruitment opportunity";
        }
        if (type.includes("customer")) {
            return "Potential customer project";
        }
        if (type.includes("employer")) {
            return "Employer or hiring manager";
        }
        return "General portfolio visitor";
    }

    function buildSummary() {
        return [
            `Lead type: ${classifyLead()}`,
            `Visitor category: ${lead.visitorType}`,
            `Name: ${lead.name}`,
            `Email: ${lead.email}`,
            `Organization: ${lead.organization}`,
            `Interest: ${lead.interest}`,
            `Timeline: ${lead.timeline}`,
            "",
            "Message:",
            lead.message
        ].join("\n");
    }

    async function sendLead() {
        const summary = buildSummary();

        if (LEAD_ENDPOINT) {
            const response = await fetch(LEAD_ENDPOINT, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
                body: JSON.stringify({
                    subject: `Portfolio lead: ${classifyLead()}`,
                    visitorType: lead.visitorType,
                    name: lead.name,
                    email: lead.email,
                    organization: lead.organization,
                    interest: lead.interest,
                    timeline: lead.timeline,
                    message: lead.message,
                    summary
                })
            });

            if (!response.ok) {
                throw new Error("Lead endpoint rejected the message.");
            }

            addMessage("Done. I have sent your details to Precious. He can follow up from there.", "bot");
            return;
        }

        const subject = encodeURIComponent(`Portfolio lead: ${classifyLead()}`);
        const body = encodeURIComponent(summary);
        window.location.href = `mailto:${OWNER_EMAIL}?subject=${subject}&body=${body}`;
        addMessage("Your email app should open with the message ready to send to Precious.", "bot");
    }

    async function handleReply(reply) {
        const cleanReply = reply.trim();
        if (!cleanReply) {
            return;
        }

        const step = steps[currentStep];
        addMessage(cleanReply, "user");

        if (step.key === "consent") {
            options.innerHTML = "";
            if (cleanReply.toLowerCase().startsWith("yes")) {
                addMessage("Thanks. I am preparing the lead summary now.", "bot");
                try {
                    await sendLead();
                } catch (error) {
                    addMessage("I could not send it automatically yet. Please email Precious directly using the contact link.", "bot");
                }
            } else {
                addMessage("No problem. You can still contact Precious anytime from the contact section.", "bot");
            }
            input.value = "";
            input.disabled = true;
            return;
        }

        lead[step.key] = cleanReply;
        currentStep += 1;
        askCurrentQuestion();
    }

    function openAssistant() {
        panel.hidden = false;
        toggle.setAttribute("aria-expanded", "true");
        input.focus();

        if (!started) {
            started = true;
            askCurrentQuestion();
        }
    }

    function closeAssistant() {
        panel.hidden = true;
        toggle.setAttribute("aria-expanded", "false");
        toggle.focus();
    }

    toggle.addEventListener("click", () => {
        if (panel.hidden) {
            openAssistant();
        } else {
            closeAssistant();
        }
    });

    closeButton.addEventListener("click", closeAssistant);

    form.addEventListener("submit", (event) => {
        event.preventDefault();
        handleReply(input.value);
    });
})();
