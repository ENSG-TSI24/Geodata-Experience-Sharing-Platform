import { FiInfo, FiGithub, FiMail } from "react-icons/fi"

function AboutPage() {
  return (
    <div className="panel">
      <div className="panel-header">
        <h2 className="panel-title">
          <FiInfo className="icon" />
          About This Application
        </h2>
      </div>

      <div className="about-content">
        <section className="about-section">
          <h3>Welcome to the Annotation Dashboard</h3>
          <p>
            This application provides powerful tools for annotating both text and geographical data. Whether you're
            conducting research, analyzing content, or mapping locations, our platform offers intuitive interfaces to
            create, manage, and export your annotations.
          </p>
        </section>

        <section className="about-section">
          <h3>Features</h3>
          <ul className="feature-list" style={{ paddingLeft: '20px' }}>
            <li>
              <strong>Text Annotation:</strong> Select and annotate text with custom labels and hierarchical relationships.
            </li>
            <li>
              <strong>Map Annotation:</strong> Place markers on maps with detailed properties and descriptions.
            </li>
            <li>
              <strong>Data Export/Import:</strong> Save your work and share it with colleagues through our JSON export/import functionality.
            </li>
            <li>
              <strong>Dark Mode:</strong> Work comfortably in any lighting condition with our dark mode option.
            </li>
          </ul>
        </section>

        <section className="about-section">
          <h3>Contact</h3>
          <div className="contact-links">
            <a href="https://github.com/ENSG-TSI24/Geodata-Experience-Sharing-Platform" className="contact-link">
              <FiGithub className="contact-icon" />
              <span>GitHub Repository</span>
            </a>
          </div>
        </section>

        <section className="about-section">
          <h3>Version</h3>
          <p>v1.0.0 - Last updated: {new Date().toLocaleDateString()}</p>
        </section>
      </div>
    </div>
  )
}

export default AboutPage

