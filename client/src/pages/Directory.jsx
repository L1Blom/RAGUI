import { useState, useEffect, useContext } from "react";
import { SettingsContext } from "../components/SettingsContext";
import Navbar from "../components/Navbar";
import Upload from "./Upload";

const Directory = () => {
    const [files, setFiles] = useState({});
    const { settings } = useContext(SettingsContext);

    // Fetch models once when the component mounts
    useEffect(() => {
        const api = `${settings.PROD_API}/prompt/${settings.Project}/context` +
            '?file=&action=list';

        fetch(api).then((res) => res.json()).then((data) => {
            setFiles(data);
        })
            .catch((error) => console.error("Error fetching models:", error));

    }, [settings]);

    if (files && files.type === 'folder') {
        return (
            <div>
                <Navbar />
                {files.name}:
                <table className="table table-striped">
                    <thead>
                        <tr><th>No</th><th>Filename</th><th>Action</th></tr>
                    </thead>
                    <tbody>
                        {files.items.map((item, index) => {
                            return (
                                <tr key={index}>
                                    <td>{index+1}</td>
                                    <td>{item.name}</td>
                                    <td>
                                        <a className="btn btn-primary" target="RAGUI" href={settings.PROD_API + '/prompt/' + settings.Project + '/file?file=data/' + settings.Project + '/' + item.name}>View</a>
                                        &nbsp;&nbsp;
                                        <a className="btn btn-primary" href={settings.PROD_API + '/prompt/' + settings.Project + '/context?file='+item.name+'&action=delete'}>Delete</a>
                                    </td>
                                </tr>
                            )
                        })}
                        <Upload />
                    </tbody>
                </table>
            </div>
        )
    }
}

export default Directory;