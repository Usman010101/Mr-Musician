    import Button from "../Button/Button";
    import { FaSearch } from "react-icons/fa";
    import Link from "next/link";
    import styles from "./navbar.module.css";

    export default function Navbar() {
        const isAuthenticated = false; // Change this to true for authenticated state

        return (
            <nav className={`navbar navbar-expand-lg px-3 ${styles.navbar}`}>
                <div className="container-fluid d-flex align-items-center justify-content-between" style={{ flexWrap: "nowrap" }}>
                    {/* Search input */}
                    <div className={`input-group ${styles.searchGroup}`}>
                        <span className={`input-group-text ${styles.searchIcon}`}>
                            <FaSearch />
                        </span>
                        <input
                            type="text"
                            className={`form-control ${styles.searchInput}`}
                            placeholder="Search for music, albums"
                        />
                    </div>

                    {/* Navigation Links */}
                    <div className="d-flex align-items-center justify-content-center mx-3" style={{ flexGrow: "1" }}>
                        <Link href="/about" className="text-white fw-bold mx-3 nav-link">
                            About Us
                        </Link>
                        <Link href="/contact" className="text-white fw-bold mx-3 nav-link">
                            Contact Us
                        </Link>
                    </div>

                    {/* Authentication Buttons */}
                    <div className="d-flex align-items-center justify-content-end" style={{ flexGrow: "1", flexWrap: "nowrap" }}>
                        {!isAuthenticated ? (
                            <>
                                <Button className="btn-outline-pink fw-bold mx-2" style={{ fontSize: "14px", padding: "6px 12px" }}>
                                    Login
                                </Button>
                                <Button className="btn-pink fw-bold mx-2" style={{ fontSize: "14px", padding: "6px 12px" }}>
                                    Sign Up
                                </Button>
                            </>
                        ) : (
                            <Button className="btn-pink fw-bold mx-2" style={{ fontSize: "14px", padding: "6px 12px" }}>
                                Logout
                            </Button>
                        )}
                    </div>
                </div>
            </nav>
        );
    }
