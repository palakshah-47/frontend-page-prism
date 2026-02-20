import { useNavigate } from "react-router-dom";
import { Project } from "../../models/schema";
import styles from './ProjectCard.module.css';

interface ProjectCardProps {
    project: Project;
    inspirationCount: number;
    thumbnailUrl?: string;
}

export const ProjectCard = ({project, inspirationCount, thumbnailUrl}: ProjectCardProps) => {
    const navigate = useNavigate();

    const handleClick = () => {
        navigate(`/projects/${project.id}`)
    }

    const formateDate = (date: Date) => {
        return new Intl.DateTimeFormat('en-US', {month: 'short', day: 'numeric', year: 'numeric'}).format(date);
    }

    return (
        <div className={styles.card} onClick={handleClick}>
            <div className={styles.thumbnail}>
            {thumbnailUrl && (<img src={thumbnailUrl} alt={project.name}></img>)}
            </div>
            <div className={styles.content}>
                <h3 className={styles.title}>{project.name}</h3>
                <p className={styles.description}>
                    {project.description || "No Description"}
                </p>
                <div className={styles.metadata}>
                    <span className={styles.count}>
                    {inspirationCount} {inspirationCount === 1 ? 'inspiration' : 'inspirations'}
                    </span>
                    <span className={styles.date}>{formateDate(new Date(project.createdAt))}</span>
                </div>

            </div>
        </div>
    )
}