"use client"

import { useState, useEffect, useCallback } from "react"
import { FiPlus, FiTrash2, FiSave } from "react-icons/fi"

function TextAnnotator() {
  const [text, setText] = useState("")
  const [submittedTexts, setSubmittedTexts] = useState([])
  const [globalAnnotations, setGlobalAnnotations] = useState([])
  const [selectedText, setSelectedText] = useState("")
  const [annotationValue, setAnnotationValue] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredAnnotations, setFilteredAnnotations] = useState([])

  // Load saved data from localStorage
  useEffect(() => {
    const savedTexts = localStorage.getItem("submittedTexts")
    const savedAnnotations = localStorage.getItem("textAnnotations")

    if (savedTexts) {
      try {
        setSubmittedTexts(JSON.parse(savedTexts))
      } catch (error) {
        console.error("Failed to parse saved texts:", error)
      }
    }

    if (savedAnnotations) {
      try {
        setGlobalAnnotations(JSON.parse(savedAnnotations))
      } catch (error) {
        console.error("Failed to parse saved annotations:", error)
      }
    }
  }, [])

  // Save data to localStorage when it changes
  useEffect(() => {
    localStorage.setItem("submittedTexts", JSON.stringify(submittedTexts))
    localStorage.setItem("textAnnotations", JSON.stringify(globalAnnotations))
  }, [submittedTexts, globalAnnotations])

  // Filter annotations when search term or annotations change
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredAnnotations(globalAnnotations)
      return
    }

    const filtered = globalAnnotations.filter(
      (annotation) =>
        annotation.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
        annotation.annotation.toLowerCase().includes(searchTerm.toLowerCase()),
    )

    setFilteredAnnotations(filtered)
  }, [searchTerm, globalAnnotations])

  const handleChange = (event) => {
    setText(event.target.value)
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    if (text.trim() !== "") {
      setSubmittedTexts((prevTexts) => [...prevTexts, text])
      setText("")
    }
  }

  const handleMouseUp = useCallback(() => {
    const selected = window.getSelection().toString().trim()
    if (selected && !globalAnnotations.some((a) => a.text === selected)) {
      setSelectedText(selected)
      setAnnotationValue("")
    }
  }, [globalAnnotations])

  const handleAnnotationSubmit = () => {
    if (selectedText && annotationValue.trim()) {
      const newAnnotation = {
        id: Date.now().toString(),
        text: selectedText,
        annotation: annotationValue.trim(),
        children: [],
        createdAt: new Date().toISOString(),
      }
      setGlobalAnnotations((prev) => [...prev, newAnnotation])
      setSelectedText("")
      setAnnotationValue("")
    }
  }

  const handleDeleteAnnotation = (id) => {
    setGlobalAnnotations((prev) => prev.filter((annotation) => annotation.id !== id))
  }

  const handleSetParent = (childAnnotation, parentAnnotation) => {
    setGlobalAnnotations((prevAnnotations) => {
      return prevAnnotations.map((annotation) => {
        if (annotation.annotation === parentAnnotation) {
          return { ...annotation, children: [...annotation.children, childAnnotation] }
        }
        if (annotation.annotation === childAnnotation) {
          return { ...annotation, parent: parentAnnotation }
        }
        return annotation
      })
    })
  }

  const handleDeleteText = (index) => {
    setSubmittedTexts((prev) => prev.filter((_, i) => i !== index))
  }

  const highlightAnnotatedText = (text) => {
    if (!globalAnnotations.length) return text

    const highlightedText = []
    let lastIndex = 0

    globalAnnotations.forEach((annotation, index) => {
      const pos = text.indexOf(annotation.text)
      if (pos !== -1) {
        if (pos > lastIndex) {
          highlightedText.push(text.substring(lastIndex, pos))
        }
        highlightedText.push(
          <span
            key={index}
            className="highlighted-text"
            title={annotation.annotation}
            data-annotation-id={annotation.id}
          >
            {annotation.text}
          </span>,
        )
        lastIndex = pos + annotation.text.length
      }
    })

    if (lastIndex < text.length) {
      highlightedText.push(text.substring(lastIndex))
    }

    return highlightedText
  }

  return (
    <div className="text-annotator">
      <form onSubmit={handleSubmit} className="text-form">
        <div className="input-group">
          <input
            type="text"
            value={text}
            onChange={handleChange}
            placeholder="Type here..."
            className="text-input"
            aria-label="Text to add"
          />
          <button type="submit" className="button button-primary" aria-label="Add text" disabled={!text.trim()}>
            <FiPlus className="button-icon" />
            <span>Add</span>
          </button>
        </div>
      </form>

      {submittedTexts.length > 0 ? (
        <div className="text-display-container">
          <h3>Submitted Texts</h3>
          <div className="text-display">
            {submittedTexts.map((line, index) => (
              <div key={index} className="text-item">
                <p onMouseUp={handleMouseUp} style={{ userSelect: "text" }}>
                  {highlightAnnotatedText(line)}
                </p>
                <button
                  onClick={() => handleDeleteText(index)}
                  className="button button-icon-only"
                  aria-label="Delete text"
                >
                  <FiTrash2 />
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="empty-state">
          <p>No texts added yet. Type something and click "Add" to get started.</p>
        </div>
      )}

      {selectedText && (
        <div className="annotation-form">
          <p>
            Annotate: <strong>"{selectedText}"</strong>
          </p>
          <div className="input-group">
            <input
              type="text"
              value={annotationValue}
              onChange={(e) => setAnnotationValue(e.target.value)}
              placeholder="Add annotation"
              className="text-input"
              aria-label="Annotation text"
            />
            <button
              onClick={handleAnnotationSubmit}
              className="button button-accent"
              disabled={!annotationValue.trim()}
              aria-label="Submit annotation"
            >
              <FiSave className="button-icon" />
              <span>Submit</span>
            </button>
          </div>
        </div>
      )}

      {globalAnnotations.length > 0 && (
        <div className="annotations-section">
          <div className="section-header">
            <h3>📌 Saved Annotations</h3>
            <div className="search-container">
              <input
                type="search"
                placeholder="Search annotations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
                aria-label="Search annotations"
              />
            </div>
          </div>

          {filteredAnnotations.length > 0 ? (
            <div className="table-responsive">
              <table className="annotations-table">
                <thead>
                  <tr>
                    <th>Text</th>
                    <th>Annotation</th>
                    <th>Child of</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAnnotations.map((annotation) => (
                    <tr key={annotation.id}>
                      <td className="text-cell">{annotation.text}</td>
                      <td>{annotation.annotation}</td>
                      <td>
                        <select
                          onChange={(e) => handleSetParent(annotation.annotation, e.target.value)}
                          value={annotation.parent || ""}
                          className="select-input"
                          aria-label="Select parent annotation"
                        >
                          <option value="">None</option>
                          {globalAnnotations.map(
                            (parent) =>
                              parent.annotation !== annotation.annotation && (
                                <option key={parent.id} value={parent.annotation}>
                                  {parent.annotation}
                                </option>
                              ),
                          )}
                        </select>
                      </td>
                      <td>
                        <button
                          onClick={() => handleDeleteAnnotation(annotation.id)}
                          className="button button-danger"
                          aria-label="Delete annotation"
                        >
                          <FiTrash2 className="button-icon" />
                          <span>Delete</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state">
              <p>No annotations match your search.</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default TextAnnotator

