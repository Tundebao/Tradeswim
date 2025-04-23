"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { Shield } from "lucide-react"
import AdminAuthModal from "./AdminAuthModal"

const AdminNavDropdownItem = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const navigate = useNavigate()

  const handleOpenModal = () => {
    // Check if user is already verified as admin
    const isAdminVerified = localStorage.getItem("adminVerified") === "true"

    if (isAdminVerified) {
      // If already verified, go directly to admin panel
      navigate("/admin")
    } else {
      // Otherwise, open the verification modal
      setIsModalOpen(true)
    }
  }

  return (
    <>
      <DropdownMenuItem
        onSelect={(e) => {
          e.preventDefault()
          handleOpenModal()
        }}
        className="cursor-pointer"
      >
        <Shield className="mr-2 h-4 w-4" />
        Admin Panel
      </DropdownMenuItem>

      <AdminAuthModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  )
}

export default AdminNavDropdownItem
