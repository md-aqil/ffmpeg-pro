import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import LeftSidebar from '../components/LeftSidebar';
import RightSidebar from '../components/RightSidebar';
import VideoTimeline from '../components/VideoTimeline';
import VideoPlayer from '../components/VideoPlayer';
import '../components/layout.css';
import './VideoEditorPage.css';

const VideoEditorPage = () => {
  const navigate = useNavigate();
  const [project, setProject] = useState(() => {
    const savedProject = localStorage.getItem('videoEditorProject');
    return savedProject ? JSON.parse(savedProject) : {
      id: Date.now(),
      name: 'Untitled Project',
      clips: [],
      tracks: {
        video: [],
        audio: [],
        overlay: []
      },
      duration: 30, // Default 30 seconds
      currentTime: 0,
      isPlaying: false,
      zoomLevel: 1,
      playbackRate: 1
    };
  });
  
  const [selectedElement, setSelectedElement] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [mediaLibrary, setMediaLibrary] = useState([]);
  const fileInputRef = useRef(null);

  // Auto-save project to localStorage
  useEffect(() => {
    localStorage.setItem('videoEditorProject', JSON.stringify(project));
  }, [project]);

  const handleFileSelect = (files) => {
    if (!files || files.length === 0) return;
    
    const newMediaItems = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const mediaItem = {
        id: Date.now() + i,
        name: file.name,
        type: file.type.split('/')[0], // 'video', 'audio', or 'image'
        file: file,
        url: URL.createObjectURL(file),
        duration: file.type.startsWith('video/') || file.type.startsWith('audio/') ? 10 : 5, // Default durations
        thumbnail: file.type.startsWith('image/') ? URL.createObjectURL(file) : null
      };
      newMediaItems.push(mediaItem);
    }
    
    setMediaLibrary(prev => [...prev, ...newMediaItems]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    handleFileSelect(files);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const addClipToTimeline = (mediaItem, trackType = 'video') => {
    const newClip = {
      id: Date.now() + Math.random(),
      mediaId: mediaItem.id,
      name: mediaItem.name,
      type: mediaItem.type,
      start: project.currentTime,
      end: project.currentTime + mediaItem.duration,
      duration: mediaItem.duration,
      track: trackType,
      filters: [],
      volume: 100,
      speed: 1
    };
    
    setProject(prev => ({
      ...prev,
      tracks: {
        ...prev.tracks,
        [trackType]: [...prev.tracks[trackType], newClip]
      },
      duration: Math.max(prev.duration, newClip.end)
    }));
  };

  const handleStop = () => {
    setProject(prev => ({
      ...prev,
      isPlaying: false,
      currentTime: 0
    }));
  };

  const handleSpeedChange = (speed) => {
    setProject(prev => ({
      ...prev,
      playbackRate: speed
    }));
  };

  const handleZoomChange = (zoom) => {
    setProject(prev => ({
      ...prev,
      zoomLevel: zoom
    }));
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      
      switch (e.key) {
        case ' ':
          e.preventDefault();
          setProject(prev => ({ ...prev, isPlaying: !prev.isPlaying }));
          break;
        case 'Escape':
          handleStop();
          break;
        case 'Delete':
          if (selectedElement) {
            // Delete selected element
            setProject(prev => {
              const trackType = selectedElement.track;
              const updatedTracks = {
                ...prev.tracks,
                [trackType]: prev.tracks[trackType].filter(clip => clip.id !== selectedElement.id)
              };
              
              return {
                ...prev,
                tracks: updatedTracks
              };
            });
            setSelectedElement(null);
          }
          break;
        default:
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedElement]);

  return (
    <div className="page-layout">
      <LeftSidebar 
        mediaLibrary={mediaLibrary}
        onAddToTimeline={addClipToTimeline}
      />
      
      <div 
        className={`converter-content video-editor-content ${isDragOver ? 'drag-over' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <div className="video-editor-header">
          <h2>Video Editor</h2>
          <div className="editor-controls">
            <button 
              className="btn btn-secondary"
              onClick={() => navigate('/video')}
            >
              Simple Converter
            </button>
          </div>
        </div>
        
        <div className="video-editor-main">
          {/* Preview Player */}
          <VideoPlayer 
            project={project}
            selectedElement={selectedElement}
          />
          
          {/* Timeline */}
          <VideoTimeline 
            project={project}
            setProject={setProject}
            selectedElement={selectedElement}
            setSelectedElement={setSelectedElement}
          />
          
          {/* Bottom Toolbar */}
          <div className="editor-toolbar">
            <div className="toolbar-group">
              <button className="btn btn-ghost" onClick={() => handleZoomChange(Math.max(0.5, project.zoomLevel - 0.5))}>Zoom Out</button>
              <button className="btn btn-ghost" onClick={() => handleZoomChange(Math.min(3, project.zoomLevel + 0.5))}>Zoom In</button>
              <span>Zoom: {project.zoomLevel}x</span>
            </div>
            <div className="toolbar-group">
              <button 
                className={`btn btn-ghost ${project.playbackRate === 0.5 ? 'active' : ''}`}
                onClick={() => handleSpeedChange(0.5)}
              >
                0.5x
              </button>
              <button 
                className={`btn btn-ghost ${project.playbackRate === 1 ? 'active' : ''}`}
                onClick={() => handleSpeedChange(1)}
              >
                1x
              </button>
              <button 
                className={`btn btn-ghost ${project.playbackRate === 2 ? 'active' : ''}`}
                onClick={() => handleSpeedChange(2)}
              >
                2x
              </button>
              <button 
                className={`btn btn-ghost ${project.playbackRate === 4 ? 'active' : ''}`}
                onClick={() => handleSpeedChange(4)}
              >
                4x
              </button>
            </div>
            <div className="toolbar-group">
              <button className="btn btn-ghost">Undo</button>
              <button className="btn btn-ghost">Redo</button>
            </div>
          </div>
        </div>
      </div>
      
      <RightSidebar 
        activeConverter="video-editor"
        selectedElement={selectedElement}
        onElementUpdate={(updatedElement) => {
          setProject(prev => {
            const trackType = updatedElement.track;
            const updatedTracks = {
              ...prev.tracks,
              [trackType]: prev.tracks[trackType].map(clip => 
                clip.id === updatedElement.id ? updatedElement : clip
              )
            };
            
            return {
              ...prev,
              tracks: updatedTracks
            };
          });
          setSelectedElement(updatedElement);
        }}
        onDeleteElement={(elementId) => {
          setProject(prev => {
            const trackTypes = ['video', 'audio', 'overlay'];
            const updatedTracks = {};
            
            trackTypes.forEach(trackType => {
              updatedTracks[trackType] = prev.tracks[trackType].filter(clip => clip.id !== elementId);
            });
            
            return {
              ...prev,
              tracks: updatedTracks
            };
          });
          setSelectedElement(null);
        }}
      />
      
      <input
        id="file-input"
        type="file"
        ref={fileInputRef}
        onChange={(e) => handleFileSelect(e.target.files)}
        accept="video/*,audio/*,image/*"
        style={{ display: 'none' }}
        multiple
      />
    </div>
  );
};

export default VideoEditorPage;