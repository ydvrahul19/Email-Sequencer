import ReactFlow, {
  Controls,
  Background,
  applyNodeChanges,
  applyEdgeChanges,
} from "reactflow";
import axios from "axios";
import Modal from "react-modal";
import "reactflow/dist/style.css";
import { useState, useCallback, useEffect } from "react";

Modal.setAppElement("#root");

// Updated modern modal styles
const customStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    transform: 'translate(-50%, -50%)',
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    padding: '24px',
    maxWidth: '500px',
    width: '90%',
    border: 'none',
    boxShadow: '0 4px 24px rgba(0, 0, 0, 0.1)',
  },
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    backdropFilter: 'blur(4px)',
  }
};

const FlowChart = () => {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [nodeCount, setNodeCount] = useState(1);
  const [selectedNodeType, setSelectedNodeType] = useState("Lead-Source");
  const [modalIsOpen, setIsOpen] = useState(false);
  const [modalContent, setModalContent] = useState("");
  const [editingNode, setEditingNode] = useState(null);

  const onNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );

  const onEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  const addNode = (label, content) => {
    const newNodeId = (nodeCount + 1).toString();
    const newNode = {
      id: newNodeId,
      data: { label: `${label}\n${content}` },
      position: { x: 100, y: nodeCount * 100 },
      style: {
        background: '#ffffff',
        border: '1px solid #e1e4e8',
        borderRadius: '8px',
        padding: '12px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
        minWidth: '200px',
      }
    };
    setNodes((nds) => nds.concat(newNode));
    setNodeCount((count) => count + 1);

    const newEdge = {
      id: `${nodeCount}-${newNodeId}`,
      source: `${nodeCount}`,
      target: newNodeId,
      style: {
        stroke: '#6366f1',
        strokeWidth: 2,
      },
      animated: true,
    };
    setEdges((eds) => eds.concat(newEdge));
  };

  const handleAddNode = () => {
    if (selectedNodeType) {
      setModalContent(selectedNodeType);
      setIsOpen(true);
      setEditingNode(null);
    } else {
      alert("Please select a valid node type.");
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const subject = formData.get("subject");
    const text = formData.get("content");
    const delay = formData.get("delay");
    const email = formData.get("email");
    let nodeContent = "";

    if (modalContent === "Cold-Email") {
      nodeContent = `- (${subject}) ${text}`;
    } else if (modalContent === "Wait/Delay") {
      nodeContent = `- (${delay})`;
    } else {
      nodeContent = `- (${email})`;
    }

    if (editingNode) {
      setNodes((nds) =>
        nds.map((node) =>
          node.id === editingNode.id
            ? { ...node, data: { label: `${modalContent}\n${nodeContent}` } }
            : node
        )
      );
    } else {
      if (selectedNodeType === "Lead-Source") {
        setSelectedNodeType("Cold-Email");
      }
      addNode(modalContent, nodeContent);
    }
    setIsOpen(false);
  };

  const renderModalContent = () => {
    const formClasses = "flex flex-col gap-4 min-w-[300px]";
    const inputClasses = "border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500";
    const labelClasses = "text-sm font-medium text-gray-700";
    const buttonClasses = "bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors mt-4";
    const selectClasses = "border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500";

    switch (modalContent) {
      case "Cold-Email":
        return (
          <form onSubmit={handleSubmit} className={formClasses}>
            <div>
              <label htmlFor="subject" className={labelClasses}>Subject:</label>
              <input
                type="text"
                name="subject"
                id="subject"
                defaultValue={editingNode?.data.label.split("- (")[1]?.split(")")[0] || ""}
                required
                className={inputClasses}
              />
            </div>
            <div>
              <label htmlFor="content" className={labelClasses}>Content:</label>
              <textarea
                name="content"
                id="content"
                defaultValue={editingNode?.data.label.split(") ")[1] || ""}
                required
                className={`${inputClasses} min-h-[100px]`}
              />
            </div>
            <button type="submit" className={buttonClasses}>
              {editingNode ? "Update Cold Email" : "Add Cold Email"}
            </button>
          </form>
        );
      case "Wait/Delay":
        return (
          <form onSubmit={handleSubmit} className={formClasses}>
            <div>
              <label htmlFor="delay" className={labelClasses}>Delay:</label>
              <select
                name="delay"
                id="delay"
                defaultValue={editingNode?.data.label.split("- (")[1]?.split(" min")[0] + " min" || ""}
                required
                className={selectClasses}
              >
                {[...Array(6).keys()].map((i) => (
                  <option key={i} value={`${i + 1} min`}>
                    {i + 1} min
                  </option>
                ))}
              </select>
            </div>
            <button type="submit" className={buttonClasses}>
              {editingNode ? "Update Delay" : "Add Delay"}
            </button>
          </form>
        );
      case "Lead-Source":
        return (
          <form onSubmit={handleSubmit} className={formClasses}>
            <div>
              <label htmlFor="email" className={labelClasses}>Recipient Email:</label>
              <input
                type="email"
                name="email"
                id="email"
                defaultValue={editingNode?.data.label.split("- (")[1]?.split(")")[0] || ""}
                required
                className={inputClasses}
              />
            </div>
            <button type="submit" className={buttonClasses}>
              {editingNode ? "Update Lead Source" : "Add Lead Source"}
            </button>
          </form>
        );
      default:
        return null;
    }
  };

  const handleNodeClick = (event, node) => {
    setModalContent(node.data.label.split("\n")[0]);
    setIsOpen(true);
    setEditingNode(node);
  };

  const handleStartProcess = async () => {
    const response = await axios.post(
      "http://localhost:8000/api/v1/email/start-process",
      {
        nodes: nodes,
        edges: edges,
      }
    );
    console.log(response.data);
  };

  return (
    <div className="w-full h-screen flex flex-col bg-gray-50">
      <div className="flex justify-between items-center p-4 bg-white border-b border-gray-200">
        <div className="flex items-center gap-6">
          <h1 className="text-xl font-semibold text-gray-800">Email Flow Builder</h1>
          <div className="flex gap-4">
            <select
              value={selectedNodeType}
              onChange={(e) => setSelectedNodeType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="Lead-Source">Lead Source</option>
              <option value="Cold-Email">Cold Email</option>
              <option value="Wait/Delay">Wait/Delay</option>
            </select>
            <button
              onClick={handleAddNode}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
            >
              Add Node
            </button>
          </div>
        </div>
        <button
          onClick={handleStartProcess}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
        >
          Start Flow
        </button>
      </div>
      
      <div className="flex-1">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={handleNodeClick}
          fitView
        >
          <Background variant="dots" gap={12} size={1} />
          <Controls />
        </ReactFlow>
      </div>

      <Modal
        isOpen={modalIsOpen}
        onRequestClose={() => setIsOpen(false)}
        style={customStyles}
        contentLabel="Node Modal"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800">{modalContent}</h2>
          <button
            onClick={() => setIsOpen(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>
        {renderModalContent()}
      </Modal>
    </div>
  );
};

export default FlowChart;
