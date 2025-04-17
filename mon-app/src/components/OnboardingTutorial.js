"use client"

import { useState } from "react"
import { FiArrowRight, FiX, FiMap, FiFileText, FiSettings, FiUsers, FiDatabase } from "react-icons/fi"
import "./OnboardingTutorial.css"
function OnboardingTutorial({ userName, userRole, onComplete }) {
  const [currentStep, setCurrentStep] = useState(0)

  // Define tutorial steps based on user role
  const steps = [
    {
      title: "Bienvenue sur la plateforme d'annotation!",
      content: `Bonjour ${userName}, nous sommes ravis de vous accueillir! Ce court tutoriel vous guidera à travers les principales fonctionnalités de notre plateforme.`,
      image: "welcome.svg",
    },
    {
      title: "Annotation de texte",
      content:
        "Utilisez l'outil d'annotation de texte pour sélectionner et catégoriser des passages importants. Vous pouvez créer des relations hiérarchiques entre vos annotations.",
      image: "text-annotation.svg",
      icon: <FiFileText className="feature-icon" />,
    },
    {
      title: "Annotation de carte",
      content:
        "Placez des marqueurs sur la carte pour identifier des emplacements importants. Ajoutez des propriétés détaillées et des métadonnées à chaque marqueur.",
      image: "map-annotation.svg",
      icon: <FiMap className="feature-icon" />,
    },
    {
      title: "Gestion des données",
      content:
        "Exportez et importez vos annotations au format JSON. Vous pouvez partager vos données avec d'autres utilisateurs ou les sauvegarder pour une utilisation ultérieure.",
      image: "data-management.svg",
      icon: <FiDatabase className="feature-icon" />,
    },
  ]

  // Add admin-specific step if user is admin
  if (userRole === "admin") {
    steps.push({
      title: "Administration du système",
      content:
        "En tant qu'administrateur, vous avez accès aux paramètres du système. Vous pouvez gérer les utilisateurs, approuver les demandes de permissions et configurer les catégories d'annotation.",
      image: "admin-panel.svg",
      icon: <FiSettings className="feature-icon" />,
    })
  } else {
    steps.push({
      title: "Demandes de permissions",
      content:
        "Vous pouvez demander des permissions supplémentaires si vous avez besoin d'accéder à plus de fonctionnalités. Les administrateurs examineront votre demande.",
      image: "permissions.svg",
      icon: <FiUsers className="feature-icon" />,
    })
  }

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      onComplete()
    }
  }

  const handleSkip = () => {
    onComplete()
  }

  return (
    <div className="onboarding-overlay">
      <div className="onboarding-modal">
        <button className="onboarding-close" onClick={handleSkip}>
          <FiX />
        </button>

        <div className="onboarding-content">
          <div className="onboarding-step">
            {steps[currentStep].icon && <div className="onboarding-icon">{steps[currentStep].icon}</div>}
            <h2>{steps[currentStep].title}</h2>
            <p>{steps[currentStep].content}</p>
          </div>

          <div className="onboarding-image">
            <img
              src={`/placeholder.svg?height=200&width=300&text=${steps[currentStep].title}`}
              alt={steps[currentStep].title}
            />
          </div>
        </div>

        <div className="onboarding-footer">
          <div className="onboarding-progress">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`progress-dot ${index === currentStep ? "active" : ""}`}
                onClick={() => setCurrentStep(index)}
              />
            ))}
          </div>

          <div className="onboarding-actions">
            <button className="button button-secondary" onClick={handleSkip}>
              Ignorer
            </button>
            <button className="button button-primary" onClick={handleNext}>
              {currentStep < steps.length - 1 ? (
                <>
                  Suivant <FiArrowRight className="button-icon" />
                </>
              ) : (
                "Commencer"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OnboardingTutorial

