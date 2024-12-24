import React, { useState } from 'react';
import { useAccountTaskGlobally } from '../../../../context/AccountTaskContext';

const DocumentStep = () => {
  const { accountTaskData } = useAccountTaskGlobally();
  const [selectedCategory, setSelectedCategory] = useState("application"); // Default to "application"

  // Function to render steps based on the selected category
  const renderSteps = (category) => {
    if (category === "application" && accountTaskData.application.length > 0) {
      return accountTaskData.application.map((item, index) => (
        <div key={index}>
          <h4>Application {index + 1}</h4>
          {item.steps && item.steps.map((step, stepIndex) => (
            <p key={stepIndex}>{step.name} - {step.status}</p>
          ))}
        </div>
      ));
    }
    if (category === "japanVisit" && accountTaskData.japanVisit.length > 0) {
      return accountTaskData.japanVisit.map((item, index) => (
        <div key={index}>
          <h4>Japan Visit {index + 1}</h4>
          {item.steps && item.steps.map((step, stepIndex) => (
            <p key={stepIndex}>{step.name} - {step.status}</p>
          ))}
        </div>
      ));
    }
    if (category === "documentTranslation" && accountTaskData.documentTranslation.length > 0) {
      return accountTaskData.documentTranslation.map((item, index) => (
        <div key={index}>
          <h4>Document Translation {index + 1}</h4>
          {item.steps && item.steps.map((step, stepIndex) => (
            <p key={stepIndex}>{step.name} - {step.status}</p>
          ))}
        </div>
      ));
    }
    if (category === "epassports" && accountTaskData.epassports.length > 0) {
      return accountTaskData.epassports.map((item, index) => (
        <div key={index}>
          <h4>E-Passport {index + 1}</h4>
          {item.steps && item.steps.map((step, stepIndex) => (
            <p key={stepIndex}>{step.name} - {step.status}</p>
          ))}
        </div>
      ));
    }
    return <p>No data available for the selected category.</p>;
  };

  // Function to handle category selection
  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
  };

  return (
    <div>
      <h3>DocumentStep here</h3>
      
      {/* Buttons or dropdown to change the category */}
      <div>
        <button onClick={() => handleCategoryChange("application")}>Application</button>
        <button onClick={() => handleCategoryChange("japanVisit")}>Japan Visit</button>
        <button onClick={() => handleCategoryChange("documentTranslation")}>Document Translation</button>
        <button onClick={() => handleCategoryChange("epassports")}>E-Passports</button>
      </div>
      
      {/* Render the steps based on the selected category */}
      {renderSteps(selectedCategory)}
    </div>
  );
};

export default DocumentStep;
